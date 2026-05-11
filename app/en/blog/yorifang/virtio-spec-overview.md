---
title: 'Introduction to Virtio Protocol'
category: blog
date: 2020-11-04
tags:
    - virtualization
    - virtio
archives: 2020-11
author:
  - Ying Fang
summary: Virtio Protocol Overview
---
## Abstract

Paravirtualization (virtio) devices have been widely used in cloud computing virtualization scenarios.  
More and more physical devices support the virtio protocol, that is, virtio offload.
The virtio protocol is offloaded to hardware (for example, virtio-net NICs and virtio-scsi) to accelerate physical machines and virtual machines (VMs).  
This article describes some key points in the virtio technology to deepen our understanding of paravirtualization.  
This article is intended for readers who have a basic understanding of I/O virtualization. It aims to help readers who want to understand the internal mechanism of virtio.  

Before we start, let's think about the following questions:  

* How are virtio devices implemented?  
* What are the contents of the configuration space of the virtio-pci device?  
* The front-end and back-end of virtio communicate with each other through the shared memory mechanism. Why is there no lock?  
* What are the key data structures in the virtio mechanism? Where is the virtio configuration interface stored? How does virtio work?  
* How do the front-end and back-end of virtio communicate with each other? What are irqfd and ioeventfd? How are they used in the communication between the front-end and back-end of virtio?
* Virtio devices support MSIx. How does QEMU/KVM simulate MSIx?  
* What are the new features of virtio modern compared with virtio legacy?  

## 0. **Introduction to **Virtio Specifications

The virtio protocol was first proposed by IBM. As a standard protocol, virtio is managed by a dedicated technical committee.  
For details about the specifications, visit the [virtio official website](http://docs.oasis-open.org/virtio/virtio/v1.0/virtio-v1.0.html).  
Developers can submit a new virtio device proposal through a Request For Comments (RFC) to the technical committee. After the proposal is approved by the committee, new virtio device types can be added.  

A virtio device consists of four parts: device status field, feature bits, device configuration space, and one or more virtqueues.  
The device status field contains six states:  

* ACKNOWLEDGE (1): The GuestOS discovers the device and acknowledges it as a valid virtio device.  
* DRIVER (2): The GuestOS knows how to drive the device.  
* FAILED (128): The GuestOS cannot drive the device because something is wrong.  
* FEATURES_OK (8): The GuestOS acknowledges all features, and the features are negotiated.  
* DRIVER_OK (4): The driver is loaded and the device is ready to use.  
* DEVICE_NEEDS_RESET (64): The device encounters an error and needs to be reset to continue working.  

The feature bits are used to identify the features supported by a device. Bits 0 to 23 are used by specific devices. Bits 24 to 37 are reserved for the queue and feature negotiation mechanisms. Bits 38 and above are reserved for other purposes in the future.  
For example, for a virtio-net device, feature bit 0 indicates that the NIC supports checksum.
The feature bit `VIRTIO_F_VERSION_1` indicates whether a device supports the virtio 1.0 specifications.  

In the virtio protocol, all devices use virtqueues to transmit data. Each device can have zero or more virtqueues, and each virtqueue occupies two or more 4-KB physical pages. Two virtqueue modes are supported: split virtqueues and packed virtqueues.  

In split virtqueues mode, a virtqueue is divided into several parts, where each part is unidirectionally writable by the front-end driver or back-end device, but not both. Each virtqueue has a 16-bit `queue size` parameter, which indicates the total length of the queue. Each virtqueue consists of three parts:  

```
	+-------------------+--------------------------------+-----------------------+
	| Descriptor Table  |   Available Ring  (padding)    |       Used Ring       |
	+-------------------+--------------------------------+-----------------------+
```

 * `Descriptor Table`: stores I/O transmission request information.  
 * `Available Ring`: records the updated items in the descriptor table. The ring can be written by the front-end driver and read only by the back-end device.  
 * `Used Ring`: records the requests that have been submitted to the hardware in the descriptor table. The ring can be read only by the front-end driver and written by the back-end device.  

The working mechanism of device I/O requests in the virtio protocol can be summarized as follows:  

1.  The front-end driver stores the I/O request in the descriptor table, updates the index to the available ring, and kicks the back-end device to obtain data.  
1.  The back-end device obtains the I/O request for processing, updates the result to the descriptor table and then the used ring, and sends an interrupt to notify the front-end driver.  

According to the virtio protocol, virtio devices can be implemented in the following modes.  

* Virtio Over PCI BUS: Virtio devices comply with the PCI specifications and are mounted to the PCI bus as virtio-pci devices.  
* Virtio Over MMIO: Virtualization platforms that do not support the PCI protocol can use this working mode and be directly mounted to the system bus.   
* Virtio Over Channel I/O: mainly used on the S390 platform. virtio-ccw uses this channel I/O-based mechanism.  

Virtio Over PCI BUS is the most widely used. A PCI device needs to report the features supported to the OS by using the PCI configuration space, so that the OS knows the type of the virtio device and calls the right front-end driver to shake hands with the device and further drive the device.  
For virtio devices, QEMU simulates the PCI configuration space and the PCI vendor ID is fixed at 0x1AF4. PCI device IDs 0x1000 to 0x107F are for virtio devices. On virtualization platforms that do not support the PCI protocol, virtio devices can be implemented through MMIO.  
Section 4.2 [Virtio Over MMIO](https://docs.oasis-open.org/virtio/virtio/v1.1/csprd01/virtio-v1.1-csprd01.html#x1-1440002) of the virtio specifications describes the implementation of the virtio-mmio device. The MMIO information can be directly reported to the Linux OS through kernel parameters. This article mainly talks about virtio-pci.  

As mentioned above, the virtio device has four parts including feature bits and virtqueues. How is the virtio device implemented in virtio-pci mode?  
Compared with the old virtio protocol, the new protocol has great changes in the virtio-pci part.
According to the virtio legacy (version 0.95), the virtio common configuration structure
is stored in the BAR0 of the device, which is called `virtio legay interface`. The structure is as follows:  

``` 
                       virtio legacy ==> Mapped into PCI BAR0 
	+------------------------------------------------------------------+ 
	|                    Host Feature Bits[0:31]                       | 
	+------------------------------------------------------------------+
	|                    Guest Feature Bits[0:31]                      |
	+------------------------------------------------------------------+
	|                    Virtqueue Address PFN                         |
	+---------------------------------+--------------------------------+
	|           Queue Select          |           Queue Size           |
	+----------------+----------------+--------------------------------+
	|   ISR Status   | Device Stat    |           Queue Notify         |
	+----------------+----------------+--------------------------------+
	|       MSI Config Vector         |         MSI Queue Vector       |
	+---------------------------------+--------------------------------+
```

For the new `virtio modern`, the protocol divides the configuration structure into five types:  
```
/* Common configuration */ 
#define VIRTIO_PCI_CAP_COMMON_CFG        1 
/* Notifications */ 
#define VIRTIO_PCI_CAP_NOTIFY_CFG        2
/* ISR Status */ 
#define VIRTIO_PCI_CAP_ISR_CFG           3 
/* Device specific configuration */ 
#define VIRTIO_PCI_CAP_DEVICE_CFG        4 
/* PCI configuration access */ 
#define VIRTIO_PCI_CAP_PCI_CFG           5 
```
Each of the preceding configuration structures is directly mapped to the BAR space of the virtio device. The location of each configuration structure
is specified by `PCI Capability list`, which shows the protocol compatibility of virtio-pci, just as that of physical PCI devices.  

```
struct virtio_pci_cap { 
        u8 cap_vndr;    /* Generic PCI field: PCI_CAP_ID_VNDR */ 
        u8 cap_next;    /* Generic PCI field: next ptr. */ 
        u8 cap_len;     /* Generic PCI field: capability length */ 
        u8 cfg_type;    /* Identifies the structure. */ 
        u8 bar;         /* Where to find it. */ 
        u8 padding[3];  /* Pad to full dword. */ 
        le32 offset;    /* Offset within bar. */ 
        le32 length;    /* Length of the structure, in bytes. */ 
};
```
The only difference is that the virtio-pci capabilities have a unified structure.
`cfg_type` indicates the capability type, and `bar` indicates the ID of the BAR space to which the configuration structure is mapped.  
In this way, each configuration structure can be accessed directly through the BAR space or through the `VIRTIO_PCI_CAP_PCI_CFG` field of the PCI configuration space.  
For details about the structure definition of each capability, see section 4.1.4.3 in the virtio specification.  


# 1. Data Sharing Between the Front-end and Back-end

When a conventional pure analog device is working, it frequently traps and exits.  
In addition, the content of the I/O request needs to be copied and passed multiple times, which severely affects the I/O performance of the device.  
Virtio uses the shared memory mechanism to improve the I/O performance of devices.
The front-end driver requests a physical address space in advance to store I/O requests, and then notifies QEMU of the GPA of the address.  
After the front-end driver sends an I/O request, QEMU can directly obtain the request from the shared memory and write the result to the corresponding address of the VM.  
In the entire process, direct delivery and retrieval is implemented, eliminating unnecessary data copy overheads.  

Virtqueue is the soul of the entire virtio solution. Each virtqueue contains three tables.
`Descriptor Table` stores I/O request descriptors, `Available Ring` records which descriptors are available,
and `Used Ring` records which descriptors have been used by the back-end.  

```
                          +------------------------------------+
                          |       virtio  guest driver         |
                          +-----------------+------------------+
                            /               |              ^
                           /                |               \
                          put            update             get
                         /                  |                 \
                        V                   V                  \
                   +----------+      +------------+        +----------+
                   |          |      |            |        |          |
                   +----------+      +------------+        +----------+
                   | available|      | descriptor |        |   used   |
                   |   ring   |      |   table    |        |   ring   |
                   +----------+      +------------+        +----------+
                   |          |      |            |        |          |
                   +----------+      +------------+        +----------+
                   |          |      |            |        |          |
                   +----------+      +------------+        +----------+
                        \                   ^                   ^
                         \                  |                  /
                         get             update              put
                           \                |                /
                            V               |               /
                           +----------------+-------------------+
                           |	   virtio host backend          |
                           +------------------------------------+
```
`Descriptor Table` stores `virtq_desc` elements. Each `virq_desc` element occupies 16 bytes.  

```
+-----------------------------------------------------------+
|                        addr/gpa [0:63]                    |
+-------------------------+-----------------+---------------+
|         len [0:31]      |  flags [0:15]   |  next [0:15]  |
+-------------------------+-----------------+---------------+
```
`addr` occupies 64 bits to store the GPA address information of an I/O request, for example, the start address of a DMA buffer.  
`len` occupies 32 bits to indicate the length of the I/O request. `flags` have three types of values:  
`VIRTQ_DESC_F_NEXT` indicates that the I/O request and the next `virtq_desc` descriptor are consecutive.  
`IRTQ_DESC_F_WRITE` indicates that the buffer is write-only.  
`VIRTQ_DESC_F_INDIRECT` indicates that the content stored in this buffer is `virtq_desc` of another group of buffers (equivalent to redirection).  
`next` indicates the index number (with `VIRTQ_DESC_F_NEXT` & `flags`) that points to the next `virtq_desc`.  

The front-end driver uses the available ring to offer I/O buffer to the back-end device. Each ring contains a `virtq_avail` that occupies eight bytes.  
If the value of `flags` is `VIRTQ_AVAIL_F_NO_INTERRUPT`, it indicates that the front-end driver notifies the back-end device:  
"Don't interrupt me when you consume a buffer." (to prevent too many interrupts from affecting efficiency).  
`idx` indicates the place where the front-end driver puts the next descriptor entry.  

```
+--------------+-------------+--------------+---------------------+
| flags [0:15] |  idx [0:15] |  ring[0:15]  |  used_event [0:15]  |
+--------------+-------------+--------------+---------------------+
```
The structure of used ring is slightly different. If the value of `flags` is `VIRTIO_F_EVENT_IDX` and the `VIRTIO_F_EVENT_IDX` feature is negotiated between the front-end and back-end, the guest puts the used ring index at the end of the available ring and notifies the back-end:  
"Hi, man, interrupt me when you finish processing this request."  
At the same time, the host puts `avail_event index` at the end of the used ring and notifies the guest:  
"Hi, man, remember to kick the `idx` request to me."  
`VIRTIO_F_EVENT_IDX` optimizes virtio notifications and interrupts, improving I/O performance in some scenarios.  

```c
/* The Guest publishes the used index for which it expects an interrupt
 * at the end of the avail ring. Host should ignore the avail->flags field. */
/* The Host publishes the avail index for which it expects a kick
 * at the end of the used ring. Guest should ignore the used->flags field. */
 
struct virtq_used { 
#define VIRTQ_USED_F_NO_NOTIFY  1 
        le16 flags; 
        le16 idx; 
        struct virtq_used_elem ring[ /* Queue Size */]; 
        le16 avail_event; /* Only if VIRTIO_F_EVENT_IDX */ 
}; 
 
/* le32 is used here for ids for padding reasons. */ 
struct virtq_used_elem { 
        /* Index of start of used descriptor chain. */ 
        le32 id; 
        /* Total length of the descriptor chain which was used (written to) */ 
        le32 len; 
};
```

That's all for the principle. The following uses a virtio NIC as an example to describe the detailed process.  
    
## 2. Front-end and Back-end Communication Mechanism (irqfd and ioeventfd)  

The shared memory solves the performance penalty caused by memory copy during the conventional I/O process and improves the communication between the front-end driver and the back-end driver.
Virtio front-end and back-end communication has only two directions: from GuestOS to QEMU or from QEMU to GuestOS.  
After preparing the I/O buffer, the front-end driver notifies the back-end QEMU:  
"I have several I/O requests ready. Process them for me."  
After the front-end notification is sent, the I/O results will take time to deliver (the OS can perform scheduling). In this case, the vCPU can do other things.  
After receiving the notification, the back-end starts to process the I/O requests. After the I/O requests are processed, the back-end interrupts and notifies the GuestOS:  
"Your I/O requests have been processed. You can take them."  
The following shows the front-end and back-end communication mechanism.  

```
             +-------------+                +-------------+
             |             |                |             |
             |             |                |             |
             |   GuestOS   |                |     QEMU    |
             |             |                |             |
             |             |                |             |
             +---+---------+                +----+--------+
                 |     ^                         |    ^
                 |     |                         |    |
             +---|-----|-------------------------|----|---+
             |   |     |                irqfd    |    |   |
             |   |     +-------------------------+    |   |
             |   |  ioeventfd                         |   |
             |   +------------------------------------+   |
             |                   KVM                      |
             +--------------------------------------------+

```

It is simple for the front-end driver to notify the back-end. QEMU sets a specific MMIO address space, which is accessed by the front-end driver to trigger VMExit.  
After exiting to the KVM, the front-end driver notifies the user-mode QEMU by using the ioeventfd mechanism.  
After detecting the ioeventfd event, the QEMU main loop poll calls callback for processing.  

```c
# The front-end driver notifies the back-end.
# The PCI bus is scanned first. If the virtio device is found, the virtio-bus is then scanned.
worker_thread --> process_one_work --> pciehp_power_thread --> pciehp_enable_slot --> 
pciehp_configure_device --> pci_bus_add_devices --> pci_bus_add_device --> device_attach --> 
__device_attach --> bus_for_each_drv --> __device_attach_driver --> driver_probe_device --> 
pci_device_probe --> local_pci_probe --> virtio_pci_probe --> register_virtio_device --> 
device_register --> device_add --> bus_probe_device --> device_initial_probe 
--> __device_attach --> bus_for_each_drv --> __device_attach_driver -->
driver_probe_device --> virtio_dev_probe --> virtnet_probe (entry for loading the NIC driver)

static int virtnet_probe(struct virtio_device *vdev) 
{
    ......
    virtio_device_ready(vdev);
}

/**
 * virtio_device_ready - enable vq use in probe function
 * @vdev: the device
 *
 * Driver must call this to use vqs in the probe function.
 *
 * Note: vqs are enabled automatically after probe returns.
 */
static inline
void virtio_device_ready(struct virtio_device *dev)
{
        unsigned status = dev->config->get_status(dev);

        BUG_ON(status & VIRTIO_CONFIG_S_DRIVER_OK);
        dev->config->set_status(dev, status | VIRTIO_CONFIG_S_DRIVER_OK);
}

# The processing flow of the QEMU/KVM back-end is as follows:
# The front-end driver writes the status bit val & VIRTIO_CONFIG_S_DRIVER_OK, which means that the front-end driver is ready.
virtio_pci_config_write  --> virtio_ioport_write --> virtio_pci_start_ioeventfd
--> virtio_bus_set_host_notifier --> virtio_bus_start_ioeventfd --> virtio_device_start_ioeventfd_impl
--> virtio_bus_set_host_notifier
    --> virtio_pci_ioeventfd_assign
        --> memory_region_add_eventfd
            --> memory_region_transaction_commit
              --> address_space_update_ioeventfds
                --> address_space_add_del_ioeventfds
                  --> kvm_io_ioeventfd_add/vhost_eventfd_add
                    --> kvm_set_ioeventfd_pio
                      --> kvm_vm_ioctl(kvm_state, KVM_IOEVENTFD, &kick)
```

In fact, this is the `Fast MMIO` implementation mechanism of QEMU.  
We can see that QEMU registers an `ioeventfd` for the memory region corresponding to the device MMIO.  
`ioctl(KVM_IOEVENTFD) `  is called to the KVM kernel, in which the information (`gpa` , `len`, `eventfd`) corresponding to the MMIO is registered with `KVM_FAST_MMIO_BUS`.  
In this way, when the guest accesses the MMIO address range and exits (triggering an EPT misconfiguration), the KVM checks whether the accessed GPA falls within a certain MMIO address space range.  
If yes, the KVM directly writes the `eventfd` and notifies QEMU, and QEMU obtains the MMIO request from the coalesced MMIO ring page.  
(Note: The PIO page and MMIO page are memory pages shared between QEMU and the KVM kernel and have been mapped in advance.)  

```c
#KVM kernel code virt/kvm/eventfd.c
kvm_vm_ioctl(KVM_IOEVENTFD)
  --> kvm_ioeventfd
    --> kvm_assign_ioeventfd
      --> kvm_assign_ioeventfd_idx

# MMIO processing flow (handle_ept_misconfig) will eventually call ioeventfd_write to notify QEMU.   
/* MMIO/PIO writes trigger an event if the addr/val match */
static int
ioeventfd_write(struct kvm_vcpu *vcpu, struct kvm_io_device *this, gpa_t addr,
                int len, const void *val)
{
        struct _ioeventfd *p = to_ioeventfd(this);

        if (!ioeventfd_in_range(p, addr, len, val))
                return -EOPNOTSUPP;

        eventfd_signal(p->eventfd, 1);
        return 0;
}
```


The back-end notifies the front-end through interrupts. QEMU/KVM has a complete interrupt simulation implementation framework.  

For the virtio-pci device, MSIx can be presented to the VM through capabilities. In this way, the MSIx interrupt is enabled when the front-end driver is loaded, and the MSIx channel is established at the back-end.  

During the loading of the front-end driver (`probe`), the virtqueue is deinitialized. In this case, the MSIx interrupt is requested and the interrupt processing function is registered.  

```c
virtnet_probe
  --> init_vqs
    --> virtnet_find_vqs
      --> vi->vdev->config->find_vqs [vp_modern_find_vqs]
        --> vp_find_vqs
          --> vp_find_vqs_msix // Requests an MSIx interrupt for each virtqueue. Generally, there is one RX queue and one TX queue.
            --> vp_request_msix_vectors // Stores the main MSIx interrupt request logic.
              --> pci_alloc_irq_vectors_affinity // Requests the MSIx interrupt descriptor (__pci_enable_msix_range).
                --> request_irq // Registers the interrupt processing function.
               
	       // The virtio-net NIC has requested at least three MSIx interrupts.
                // One is the configuration change interrupt. (After the configuration space changes, QEMU notifies the front-end of the change.)
                // One MSIx interrupt for the TX queue and one MSIx interrupt for the RX queue
```

On the QEMU/KVM side, simulate the MSIx interrupts. The process is as follows:  
```c
virtio_pci_config_write
  --> virtio_ioport_write
    --> virtio_set_status
      --> virtio_net_vhost_status
        --> vhost_net_start
          --> virtio_pci_set_guest_notifiers
            --> kvm_virtio_pci_vector_use 
              |--> kvm_irqchip_add_msi_route // Updates the interrupt routing table.
              |--> kvm_virtio_pci_irqfd_use  // Enables the MSIx interrupt.
                 --> kvm_irqchip_add_irqfd_notifier_gsi
                   --> kvm_irqchip_assign_irqfd
                  
# When an MSIx interrupt is requested, a GSI is allocated to the MSIx, an irqfd is bound to the GSI, and ioctl KVM_IRQFD is called to register the GSI with the kernel.                
static int kvm_irqchip_assign_irqfd(KVMState *s, int fd, int rfd, int virq,
                                    bool assign)
{
    struct kvm_irqfd irqfd = {
        .fd = fd,
        .gsi = virq,
        .flags = assign ? 0 : KVM_IRQFD_FLAG_DEASSIGN,
    };

    if (rfd != -1) {
        irqfd.flags |= KVM_IRQFD_FLAG_RESAMPLE;
        irqfd.resamplefd = rfd;
    }

    if (!kvm_irqfds_enabled()) {
        return -ENOSYS;
    }

    return kvm_vm_ioctl(s, KVM_IRQFD, &irqfd);
}

# KVM kernel code virt/kvm/eventfd.c
kvm_vm_ioctl(s, KVM_IRQFD, &irqfd)
  --> kvm_irqfd_assign
    --> vfs_poll(f.file, &irqfd->pt) // Polls the irqfd in the kernel.

```

According to the preceding process, QEMU/KVM uses the irqfd mechanism to simulate MSIx interrupts, that is, when requesting the MSIx interrupt, the device allocates a GSI to the MSIx (in this case, the IRQ routing table is updated), binds an irqfd to the GSI, and polls the irqfd in the kernel.  
After processing the I/O, QEMU writes the irqfd corresponding to MSIx and injects an MSIx interrupt to the front-end to notify the front-end that the I/O request has been processed.  

For example, virtio-scsi fetches I/O requests from the front-end and performs DMA operations (DMA is asynchronous and is processed by the QEMU coroutines).  
After the DMA is complete, QEMU calls `virtio_notify_irqfd` to inject an MSIx interrupt to notify the front-end that the I/O request is complete.  


```c
#0  0x00005604798d569b in virtio_notify_irqfd (vdev=0x56047d12d670, vq=0x7fab10006110) at  hw/virtio/virtio.c:1684
#1  0x00005604798adea4 in virtio_scsi_complete_req (req=0x56047d09fa70) at  hw/scsi/virtio-scsi.c:76
#2  0x00005604798aecfb in virtio_scsi_complete_cmd_req (req=0x56047d09fa70) at  hw/scsi/virtio-scsi.c:468
#3  0x00005604798aee9d in virtio_scsi_command_complete (r=0x56047ccb0be0, status=0, resid=0) at  hw/scsi/virtio-scsi.c:495
#4  0x0000560479b397cf in scsi_req_complete (req=0x56047ccb0be0, status=0) at hw/scsi/scsi-bus.c:1404
#5  0x0000560479b2b503 in scsi_dma_complete_noio (r=0x56047ccb0be0, ret=0) at hw/scsi/scsi-disk.c:279
#6  0x0000560479b2b610 in scsi_dma_complete (opaque=0x56047ccb0be0, ret=0) at hw/scsi/scsi-disk.c:300
#7  0x00005604799b89e3 in dma_complete (dbs=0x56047c6e9ab0, ret=0) at dma-helpers.c:118
#8  0x00005604799b8a90 in dma_blk_cb (opaque=0x56047c6e9ab0, ret=0) at dma-helpers.c:136
#9  0x0000560479cf5220 in blk_aio_complete (acb=0x56047cd77d40) at block/block-backend.c:1327
#10 0x0000560479cf5470 in blk_aio_read_entry (opaque=0x56047cd77d40) at block/block-backend.c:1387
#11 0x0000560479df49c4 in coroutine_trampoline (i0=2095821104, i1=22020) at util/coroutine-ucontext.c:115
#12 0x00007fab214d82c0 in __start_context () at /usr/lib64/libc.so.6
```

In the `virtio_notify_irqfd ` function, an irqfd is written to send a signal to the kernel.  

```c
void virtio_notify_irqfd(VirtIODevice *vdev, VirtQueue *vq)
{
    ...
     /*
     * virtio spec 1.0 says ISR bit 0 should be ignored with MSI, but
     * windows drivers included in virtio-win 1.8.0 (circa 2015) are
     * incorrectly polling this bit during crashdump and hibernation
     * in MSI mode, causing a hang if this bit is never updated.
     * Recent releases of Windows do not really shut down, but rather
     * log out and hibernate to make the next startup faster.  Hence,
     * this manifested as a more serious hang during shutdown with
     *
     * Next driver release from 2016 fixed this problem, so working around it
     * is not a must, but it's easy to do so let's do it here.
     *
     * Note: it's safe to update ISR from any thread as it was switched
     * to an atomic operation.
     */
    virtio_set_isr(vq->vdev, 0x1);
    event_notifier_set(&vq->guest_notifier);   // Writes vq->guest_notifier, that is, irqfd.
}
```

After QEMU writes the irqfd, the irqfd poll module in the KVM kernel receives a `POLL_IN` event and automatically delivers the MSIx interrupt to the corresponding LAPIC.  
The overall process is as follows: `POLL_IN` -> `kvm_arch_set_irq_inatomic` -> `kvm_set_msi_irq`, `kvm_irq_delivery_to_apic_fast`

```c
static int
irqfd_wakeup(wait_queue_entry_t *wait, unsigned mode, int sync, void *key)
{
        if (flags & EPOLLIN) {
                idx = srcu_read_lock(&kvm->irq_srcu);
                do {
                        seq = read_seqcount_begin(&irqfd->irq_entry_sc);
                        irq = irqfd->irq_entry;
                } while (read_seqcount_retry(&irqfd->irq_entry_sc, seq));
                /* An event has been signaled, inject an interrupt */
                if (kvm_arch_set_irq_inatomic(&irq, kvm,
                                             KVM_USERSPACE_IRQ_SOURCE_ID, 1,
                                             false) == -EWOULDBLOCK)
                        schedule_work(&irqfd->inject);
                srcu_read_unlock(&kvm->irq_srcu, idx);
        }

```

According to the code and debugging information, the MSI interrupt of virtio-blk/virtio-scsi uses the irqfd mechanism.  
However, virtio-net (when vhost is off) does not use irqfd but directly calls `virtio_notify`/`virtio_pci_notify`.  
So the interrupt is delivered through the KVM ioctl.  
Why is the code path longer when irqfd is not used? If you know the reason, please tell me at [here](https://patchwork.kernel.org/patch/9531577/).  

```
Once in virtio_notify_irqfd, once in virtio_queue_guest_notifier_read.

Unfortunately, for virtio-blk + MSI + KVM + old Windows drivers we need the one in virtio_notify_irqfd.
For virtio-net + vhost + INTx we need the one in virtio_queue_guest_notifier_read. 
# It's obviously a longer path.
```

So far, the front-end and back-end communication mechanism of virtio is clear. In the last section, virtio-net is used as an example to describe some core code of virtio.  


## 3. Virtio Core Code Analysis (virtio-net)

The virtio-net NIC is used as an example. If no vhost is used, packets sent and received by the NIC are processed by the QEMU, but packets sent and received by the vhost are different, which will be analyzed in the future.  

### 3.1 **Front-end and Back-end Handshake Process**
QEMU simulates a PCI device. When the device driver is loaded, it attempts to deinitialize the device.  

```c
# Call virtio_pci_probe on the PCI bus, and then call virtio_dev_probe on virtio-bus.
# virtio_dev_probe finally calls virtnet_probe.
pci_device_probe --> local_pci_probe --> virtio_pci_probe --> register_virtio_device --> 
device_register --> device_add --> bus_probe_device --> device_initial_probe 
--> __device_attach --> bus_for_each_drv --> __device_attach_driver --> driver_probe_device --> 
virtio_dev_probe --> virtnet_probe

# virtio_pci_probe attempts to read the device configuration structure in virtio modern mode. If the reading fails, it changes to the virtio legacy mode.  
# In virtio legacy mode, the virtio legacy protocol specifies that the device configuration structure is stored in PCI BAR0.  
/* the PCI probing function */
int virtio_pci_legacy_probe(struct virtio_pci_device *vp_dev)
{
        rc = pci_request_region(pci_dev, 0, "virtio-pci-legacy");  // Maps BAR0 of the device to the physical address space.
        vp_dev->ioaddr = pci_iomap(pci_dev, 0, 0);   // Obtains the kernel address of BAR0.
}

#In virtio modern mode, the location of the configuration structure is found using capability. There are five types of configuration structures.  
int virtio_pci_modern_probe(struct virtio_pci_device *vp_dev)
{
        /* check for a common config: if not, use legacy mode (bar 0). */
        common = virtio_pci_find_capability(pci_dev, VIRTIO_PCI_CAP_COMMON_CFG,
                                            IORESOURCE_IO | IORESOURCE_MEM,
                                            &vp_dev->modern_bars);

        /* If common is there, these should be too... */
        isr = virtio_pci_find_capability(pci_dev, VIRTIO_PCI_CAP_ISR_CFG,
                                         IORESOURCE_IO | IORESOURCE_MEM,
                                         &vp_dev->modern_bars);
        notify = virtio_pci_find_capability(pci_dev, VIRTIO_PCI_CAP_NOTIFY_CFG,
                                            IORESOURCE_IO | IORESOURCE_MEM,
                                            &vp_dev->modern_bars);
                                            
        /* Device capability is only mandatory for devices that have
        * device-specific configuration.
        */
        device = virtio_pci_find_capability(pci_dev, VIRTIO_PCI_CAP_DEVICE_CFG,
                                            IORESOURCE_IO | IORESOURCE_MEM,
                                            &vp_dev->modern_bars);

        err = pci_request_selected_regions(pci_dev, vp_dev->modern_bars,
                                            "virtio-pci-modern");
                                        sizeof(struct virtio_pci_common_cfg), 4,
                                        0, sizeof(struct virtio_pci_common_cfg),
                                        NULL);
        // Maps the BAR space where the virtio configuration structure is located to the kernel address space.                               
        vp_dev->common = map_capability(pci_dev, common,
                                        sizeof(struct virtio_pci_common_cfg), 4,
                                        0, sizeof(struct virtio_pci_common_cfg),
                                        NULL);
        ......                              
}

# Call virtio_dev_probe.  
static int virtio_dev_probe(struct device *_d)
{
        /* We have a driver! */
        virtio_add_status(dev, VIRTIO_CONFIG_S_DRIVER);     // Updates the status bit. The configuration structure needs to be written here.

        /* Figure out what features the device supports. */
        device_features = dev->config->get_features(dev);   // Figures out what features the device supports.
        
        // Negotiates the feature set and obtains the intersection.
        err = virtio_finalize_features(dev); 
        
        // Calls the driver probe of a specific virtio device, for example, virtnet_probe or virtblk_probe.
        err = drv->probe(dev); 
}
```

Let's look at some key processes in `virtnet_probe`, including the main logic for front-end initialization of the virtio-net NIC.  

```c
static int virtnet_probe(struct virtio_device *vdev)
{
       // Checks whether the back-end supports multiple queues and creates queues as needed.
       /* Allocate ourselves a network device with room for our info */
        dev = alloc_etherdev_mq(sizeof(struct virtnet_info), max_queue_pairs);
        
        // Defines a network device and configures some attributes, such as the MAC address.
        dev->ethtool_ops = &virtnet_ethtool_ops;
	       SET_NETDEV_DEV(dev, &vdev->dev);
 
        // Initializes the virtqueue.
        err = init_vqs(vi);
        
        // Registers the network device.
        err = register_netdev(dev);
        
        // Writes the status bit DRIVER_OK to notify the back-end that the front-end is ready.
        virtio_device_ready(vdev);
        
        // Makes the NIC link go up.
        netif_carrier_on(dev);
}
```
The key process is `init_vqs`. The `vp_find_vqs_msix` process attempts to request the MSIx interrupt, which has been analyzed in the preceding sections.  
The interrupt service routine (ISR) for configuration changed is `vp_config_changed` and 
for virtqueue is `vp_vring_interrupt`.  

```c
init_vqs --> virtnet_find_vqs --> vi->vdev->config->find_vqs --> vp_modern_find_vqs
--> vp_find_vqs --> vp_find_vqs_msix

static int vp_find_vqs_msix(struct virtio_device *vdev, unsigned nvqs,
		struct virtqueue *vqs[], vq_callback_t *callbacks[],
		const char * const names[], bool per_vq_vectors,
		const bool *ctx,
		struct irq_affinity *desc)
{
        /* Request an MSIx interrupt for the configuration change.*/
	err = vp_request_msix_vectors(vdev, nvectors, per_vq_vectors,
			      per_vq_vectors ? desc : NULL);
        for (i = 0; i < nvqs; ++i) {
		 // Creates a queue --> vring_create_virtqueue --> vring_create_virtqueue_split --> vring_alloc_queue.
	         vqs[i] = vp_setup_vq(vdev, queue_idx++, callbacks[i], names[i],
                                ctx ? ctx[i] : false,
                                msix_vec);
		// Requests an MSIx interrupt for each queue.
                err = request_irq(pci_irq_vector(vp_dev->pci_dev, msix_vec),
                                  vring_interrupt, 0,
                                  vp_dev->msix_names[msix_vec],
                                  vqs[i]);
	}
```

After the `vp_setup_vq` process, shared memory pages are allocated to establish a shared memory communication channel.  
Note that the callbacks parameter is passed to the callback processing functions of the TX queue and RX queue.  
The value is passed from `virtnet_find_vqs` to `__vring_new_virtqueue` and finally assigned to `vq->vq.callback`.  

```
static struct virtqueue *vring_create_virtqueue_split(
        unsigned int index,
        unsigned int num,
        unsigned int vring_align,
        struct virtio_device *vdev,
        bool weak_barriers,
        bool may_reduce_num,
        bool context,
        bool (*notify)(struct virtqueue *),
        void (*callback)(struct virtqueue *),
        const char *name)
{
       /* TODO: allocate each queue chunk individually */
        for (; num && vring_size(num, vring_align) > PAGE_SIZE; num /= 2) {
		// Requests a physical page and assigns the address to the queue.
                queue = vring_alloc_queue(vdev, vring_size(num, vring_align),
                                          &dma_addr,
                                          GFP_KERNEL|__GFP_NOWARN|__GFP_ZERO);
        }


        queue_size_in_bytes = vring_size(num, vring_align);
        vring_init(&vring, num, queue, vring_align); // Determines the position of the descriptor table, available ring, and used ring.
}
```

If the virtqueue receives an MSIx interrupt message, which hook is called to process the message?  

```c
irqreturn_t vring_interrupt(int irq, void *_vq)
{
        struct vring_virtqueue *vq = to_vvq(_vq);

        if (!more_used(vq)) {
                pr_debug("virtqueue interrupt with no work for %p\n", vq);
                return IRQ_NONE;
        }

        if (unlikely(vq->broken))
                return IRQ_HANDLED;

        pr_debug("virtqueue callback for %p (%p)\n", vq, vq->vq.callback);
        if (vq->vq.callback)
                vq->vq.callback(&vq->vq);

        return IRQ_HANDLED;
}
EXPORT_SYMBOL_GPL(vring_interrupt);  
```

It is obvious that the IRS calls the callback on the queue.  
Let's look at `virtnet_find_vqs` in detail. The callback function of the RX queue is `skb_recv_done`, and that of the TX queue is `skb_xmit_done`.  

```
static int virtnet_find_vqs(struct virtnet_info *vi)
{
       /* Allocate/initialize parameters for send/receive virtqueues */
        for (i = 0; i < vi->max_queue_pairs; i++) {
		callbacks[rxq2vq(i)] = skb_recv_done;
		callbacks[txq2vq(i)] = skb_xmit_done;
	}
}
```

OK. That's all for this section.  

### 3.2 Implementation of virtio-net NIC Packet Receiving and Sending on virtqueue  

This section uses virtio-net (non-vhost-net mode) as an example to analyze the implementation of packet sending and receiving using the virtio protocol.  
In virtio-net mode, the NIC sends and receives packets as follows:  

* Receiving packets: Hardware => Host Kernel => QEMU => Guest
* Sending packet: Guest => Host Kernel => QEMU => Host Kernel => Hardware

#### 3.2.1 Sending Packets Using the virtio-net NIC

When the virtio-net device is initialized, a `net_device` is created.
`virtnet_probe` -> `alloc_etherdev_mq` registers `netdev_ops = &virtnet_netdev`. 
`virtnet_netdev` is the callback function set of the NIC driver (settings of packet sending and receiving related parameters).  

```c
static const struct net_device_ops netdev_ops = {
        .ndo_open               = rio_open,
        .ndo_start_xmit = start_xmit,
        .ndo_stop               = rio_close,
        .ndo_get_stats          = get_stats,
        .ndo_validate_addr      = eth_validate_addr,
        .ndo_set_mac_address    = eth_mac_addr,
        .ndo_set_rx_mode        = set_multicast,
        .ndo_do_ioctl           = rio_ioctl,
        .ndo_tx_timeout         = rio_tx_timeout,
};
```

When sending packets, the NIC calls `ndo_start_xmit` to send the data discarded by the upper-layer TCP/IP protocol stack.  
The callback function of the virtio NIC is `start_xmit`. According to the code, skb is sent to virtqueue,
Then `virtqueue_kick` is called to instruct the QEMU back-end to send the data packet.  

The virtio-net driver in the guest kernel sends packets.  
```c
# Kernel driver virtio_net.c
start_xmit
	// Puts skb in the virtqueue.
 	-> xmit_skb -> sg_init_table,virtqueue_add_outbuf -> virtqueue_add
	// Kicks to notify the QEMU back-end to obtain the data.
	virtqueue_kick_prepare && virtqueue_notify 
	// Increases the number of kick times by 1.
	sq->stats.kicks++
```

The guest kicks the back-end to exit from the VMExit in the KVM and enters the user-mode QEMU (through ioeventfd). The QEMU sends the data.  
The calling process is:
`virtio_queue_host_notifier_read` -> `virtio_net_handle_tx_bh` -> `virtio_net_flush_tx`
-> `virtqueue_pop` -> `qemu_sendv_packet_async`

```c
# QEMU virtio-net code:
virtio_queue_host_notifier_read -> virtio_queue_notify_vq
    -> vq->handle_output -> virtio_net_handle_tx_bh // When the queue is registered, the callback function is registered.
        -> qemu_bh_schedule -> virtio_net_tx_bh
            -> virtio_net_flush_tx
	        -> virtqueue_pop
		-> qemu_sendv_packet_async // Puts packets in the TX queue. The file descriptor writing packets to the tap device sends the packets.
		    -> tap_receive_iov -> tap_write_packet
		    
// Calls tap_write_packet to send the packets to the tap device for further sending.
```

#### 3.2.2 Receiving Packets Using the virtio-net NIC

When the NIC receives packets, the tap device receives the packets first, and the file descriptor of the tap device for the virtio-net NIC becomes readable.  
After receiving the POLL_IN event, the QEMU main loop poll calls the callback function to receive packets.  

```c
tap_send -> qemu_send_packet_async -> qemu_send_packet_async_with_flags
    -> qemu_net_queue_send
        -> qemu_net_queue_deliver
	    -> qemu_deliver_packet_iov
	        -> nc_sendv_compat
		    -> virtio_net_receive
		        -> virtio_net_receive_rcu
```
  
The virtio-net NIC calls `virtio_net_receive_rcu` to receive packets.  
Similar to packet sending, `virtqueue_pop` is called to obtain virtqueue elements from the front-end.  
After the packets are filled in the vring, `virtio_notify` is called to inject an interrupt to notify the front-end driver of obtaining the result.  

 

## 4. References

1. [virtio spec v1.1 ](https://docs.oasis-open.org/virtio/virtio/v1.1/csprd01/virtio-v1.1-csprd01.html)
1. [Towards a De-Facto Standard For Virtual](https://ozlabs.org/~rusty/virtio-spec/virtio-paper.pdf)
1. [https://github.com/qemu/qemu/blob/master/hw/net/virtio-net.c](https://github.com/qemu/qemu/blob/master/hw/net/virtio-net.c)
1. [https://github.com/torvalds/linux/blob/master/drivers/net/virtio_net.c](https://github.com/torvalds/linux/blob/master/drivers/net/virtio_net.c)
