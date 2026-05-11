---
title: 'JSON Parsing and Generation in iSulad'
category: blog
date: 2020-09-09
tags:
    - iSulad
    - JSON
archives: 2020-09
author:
  - haozi007
summary: This blog details how iSulad handles JSON.
---

For developers who are accustomed to high-level languages, JSON parsing and generation are simple, but this is not true for the C language. Because C does not support reflection, it cannot dynamically parse and generate JSON format data. However, a large number of JSON parsing and generation operations are involved in container engines.  

To properly handle JSON, iSulad has gone through several phases. To better understand the gaps between these phases, I will explain them as different times of weapons.  

## Cold Weapon Era

C has some JSON parsing libraries, such as `yajl` and `cjson`. These libraries can parse JSON strings into elements in a tree structure, so that you can quickly obtain the `key/value` mapping in JSON data by traversing the tree. You can also build elements in a tree structure to generate JSON strings. Then, let's see how to perform mutual conversion between JSON and C structures.  

### Usage

Take `yajl` as an example to implement marshaling and unmarshaling of the `isula_version` struct.  

```c
#include <yajl/yajl_tree.h>
#include <yajl/yajl_gen.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

struct isula_version {
    int large;
    int middle;
    int small;
    char *version;
};

void free_isula_version(struct isula_version *ptr)
{
    if (ptr == NULL) {
        return;
    }
    free(ptr->version);
    ptr->version = NULL;
    free(ptr);
}

static inline yajl_val get_val(yajl_val tree, const char *name, yajl_type type) {                                                                                     
    const char *path[] = { name, NULL };
    return yajl_tree_get(tree, path, type);
}

struct isula_version *unmarshal(const char *json_str)
{
    char buf[1024];
    yajl_val tree;
    struct isula_version *result = NULL;

    if (json_str == NULL) {
        return NULL;
    }
    result = calloc(1, sizeof(struct isula_version));
    if (result == NULL) {
        return NULL;
    }
    tree = yajl_tree_parse(json_str, buf, sizeof(buf));
    if (tree == NULL) {
        printf("Invalid json string: %s\n", json_str);
        goto err_out;
    }
    {
        yajl_val val = get_val(tree, "Large", yajl_t_number);
        if (val != NULL) {
            result->large = YAJL_GET_INTEGER(val);
        }
    }
    {
        yajl_val val = get_val(tree, "Small", yajl_t_number);
        if (val != NULL) {
            result->small = YAJL_GET_INTEGER(val);
        }
    }
    {
        yajl_val val = get_val(tree, "Middle", yajl_t_number);
        if (val != NULL) {
            result->middle = YAJL_GET_INTEGER(val);
        }
    }
    {
        yajl_val val = get_val(tree, "Version", yajl_t_string);
        if (val != NULL) {
            char *str = YAJL_GET_STRING(val);
            result->version = strdup(str);
        }
    }

    goto out;
err_out:
    free_isula_version(result);
    result = NULL;
out:
    yajl_tree_free(tree);
    return result;
}

char *marshal(struct isula_version *ptr)
{
    char *result = NULL;
    const unsigned char *gen_buf = NULL;
    size_t gen_len = 0;

    if (ptr == NULL) {
        return NULL;
    }

    yajl_gen g = yajl_gen_alloc(NULL);
    yajl_gen_status stat = yajl_gen_status_ok;

    stat = yajl_gen_map_open((yajl_gen)g);
    if (stat != yajl_gen_status_ok) {
        goto free_out;
    }
    /* gen struct items */
    if (ptr->version != NULL) {
        stat = yajl_gen_string((yajl_gen)g, (const unsigned char *)("Version"), strlen("Version"));
        if (yajl_gen_status_ok != stat) {
            goto free_out;
        }
        stat = yajl_gen_string((yajl_gen)g, (const unsigned char *)ptr->version, strlen(ptr->version));
        if (yajl_gen_status_ok != stat) {
            goto free_out;
        }
    }

    stat = yajl_gen_string((yajl_gen)g, (const unsigned char *)("Large"), strlen("Large"));
    if (yajl_gen_status_ok != stat) {
        goto free_out;
    }

    stat = yajl_gen_integer((yajl_gen)g, (long long int)ptr->large);
    if (yajl_gen_status_ok != stat) {
        goto free_out;
    }

    stat = yajl_gen_string((yajl_gen)g, (const unsigned char *)("Middle"), strlen("Middle"));
    if (yajl_gen_status_ok != stat) {
        goto free_out;
    }

    stat = yajl_gen_integer((yajl_gen)g, (long long int)ptr->middle);
    if (yajl_gen_status_ok != stat) {
        goto free_out;
    }

    stat = yajl_gen_string((yajl_gen)g, (const unsigned char *)("Small"), strlen("Small"));
    if (yajl_gen_status_ok != stat) {
        goto free_out;
    }

    stat = yajl_gen_integer((yajl_gen)g, (long long int)ptr->small);
    if (yajl_gen_status_ok != stat) {
        goto free_out;
    }

    stat = yajl_gen_map_close((yajl_gen)g);
    if (stat != yajl_gen_status_ok) {
        goto free_out;
    }

    yajl_gen_get_buf(g, &gen_buf, &gen_len);
    if (gen_buf == NULL) {
        printf("gen buf failed\n");
        goto free_out;
    }

    result = calloc(gen_len + 1, sizeof(char));
    if (result == NULL) {
        printf("out of memory\n");
        goto free_out;
    }
    (void)memcpy(result, gen_buf, gen_len);

free_out:
    yajl_gen_clear(g);
    yajl_gen_free(g);
    return result;
}

void show_isula_version(const struct isula_version *ptr)
{
    printf("iSula version: \n");
    if (ptr == NULL) {
        return;
    }
    printf("large: %d\nmiddle: %d\nsmall: %d\n", ptr->large, ptr->middle, ptr->small);
    printf("version: %s\n", ptr->version);
}

int main()
{
    const char *json_str = "{\"Version\":\"1.0.0\", \"Large\": 1, \"Middle\": 0, \"Small\": 0}";
    struct isula_version *ptr = NULL;
    char *marshaled = NULL;

    // step 1: unmarshal json string
    ptr = unmarshal(json_str);
    if (ptr == NULL) {
        printf("unmarshal failed\n");
        return -1;
    }
    show_isula_version(ptr);

    // step 2: marshal isula version
    free(ptr->version);
    ptr->version = strdup("2.0.0");
    ptr->large = 2;
    ptr->middle = 1;
    ptr->small = 1;
    marshaled = marshal(ptr);
    printf("marshal isula version:\n\t%s\n", marshaled);

    free(marshaled);
    free_isula_version(ptr);
}
```

The execution result is as follows:  

```bash
$ ./a.out 
iSula version: 
large: 1
middle: 0
small: 0
version: 1.0.0
marshal isula version:
	{"Version":"2.0.0","Large":2,"Middle":1,"Small":1}
```

Although this method is not as efficient and simple as a language that supports dynamic parsing, it can solve the problem.  

### Defects

According to the example, about 160 lines of code are required to complete the mapping between JSON and a very simple struct. However, some projects have a large number of such strucs to be mapped. This method makes it difficult to control the code quality of participants in large projects, and the efficiency is low. The main defects are summarized as follows:  

- The mapping workload is heavy.  
- Code needs to be adapted separately for each struct, making it impossible for automation.  
- The efficiency is low.  
- The code quality is uncontrollable.  

## Pseudo-Hot Weapon Era

Because C does not support reflection, dynamic parsing cannot be implemented. However, other methods are available to simplify the parsing process, improve efficiency, implement automation, and control the code quality. The [libocispec project](https://github.com/containers/libocispec) was discovered in 2017 to provide a solution to the mapping between JSON and C structs.  

- Use [JSON Schema](http://json-schema.org/) to describe the structure information of JSON strings.  
- Use Python to parse `JSON Schema` information.  
- Automatically generate the mapping code between C structs and JSON based on the `JSON Schema` information.  

This method can fix the defects in the previous section:  

- The workload is greatly reduced. You only need to write the `JSON Schema` file.  
- Code can be automatically parsed.  
- The efficiency is high.  
- The code quality is controllable and depends on the quality of the generation framework.  

>**Note: In the early stage, libocispec can only be used to parse JSON of the OCI specification. After contributions of many community developers to extensive feature upgrades, it has gained more powerful capabilities.**
  
### Integration of libocispec on iSulad

iSulad manages the JSON mapping code in the `lcr` project and provides corresponding functions through a dynamic library and header file.  

The structure of the open source Python framework for generating the code is as follows:  

```bash
$ tree third_party/libocispec/
third_party/libocispec/
├── CMakeLists.txt
├── common_c.py
├── common_h.py
├── generate.py
├── headers.py
├── helpers.py
├── read_file.c
├── read_file.h
└── sources.py
```

The `JSON Schema` file layout is as follows (a large number of schema files exist because all JSON schemas involved in iSulad are stored in this directory):  

```bash
$ tree -d 1 src/json/schema/
src/json/schema/
├── cni
│   └── network
├── container
├── cri
├── docker
│   ├── image
│   └── types
├── embedded
├── host
├── image
├── imagetool
├── logger
├── oci
│   ├── image
│   └── runtime
├── plugin
├── registry
├── shim
│   └── client
└── storage
```

During `CMake` running, the Python framework is triggered to generate mapping code based on all schemas in the **schema** directory. The following information is displayed:  

```bash
$ mkdir build
$ cd build
$ cmake ../
......
Reflection:	isulad-daemon-configs.json                                   Success
Reflection:	timestamp.json                                               Success
Reflection:	web-signature.json                                           Success
Reflection:	host-config.json                                             Success
Reflection:	defs.json                                                    Success
Reflection:	config.json                                                  Success
Reflection:	manifest.json                                                Success
Reflection:	layers.json                                                  Success
......
```

### Usage

To map a new struct to JSON, you only need to add a schema file to the `JSON Schema` directory. The following uses `isula_version` in the preceding section as an example.  

Add the schema file `isula_version.json`.  

```bash
$ cat ../src/json/schema/isula_version.json
{
	"$schema": "http://json-schema.org/draft-04/schema#",
	"type": "object",
	"properties": {
		"Version": {
			"type": "string"
		},
        "Large": {
			"type": "int32"
        },
        "Middle": {
			"type": "int32"
        },
        "Small": {
			"type": "int32"
        }
    }
}
```

Run `CMake` again. Two new files are generated:  

```bash
$ ls build/json/isula_version.*
build/json/isula_version.c  build/json/isula_version.h
```

The external interfaces of the generated code are as follows:  

```c
$ cat build/json/isula_version.h 
// Generated from isula_version.json. Do not edit!
#ifndef ISULA_VERSION_SCHEMA_H
#define ISULA_VERSION_SCHEMA_H

#include <sys/types.h>
#include <stdint.h>
#include "json_common.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    char *version;

    int32_t large;

    int32_t middle;

    int32_t small;
}
isula_version;

void free_isula_version(isula_version *ptr);

isula_version *make_isula_version(yajl_val tree, const struct parser_context *ctx, parser_error *err);

yajl_gen_status gen_isula_version(yajl_gen g, const isula_version *ptr, const struct parser_context *ctx, parser_error *err);

isula_version *isula_version_parse_file(const char *filename, const struct parser_context *ctx, parser_error *err);

isula_version *isula_version_parse_file_stream(FILE *stream, const struct parser_context *ctx, parser_error *err);

isula_version *isula_version_parse_data(const char *jsondata, const struct parser_context *ctx, parser_error *err);

char *isula_version_generate_json(const isula_version *ptr, const struct parser_context *ctx, parser_error *err);

#ifdef __cplusplus
}
#endif

#endif

```

Perform the following test case.  

```c
$ cat test.c 
#include "isula_version.h"
#include <stdio.h>

void show_isula_version(const isula_version *ptr)
{
    printf("iSula version: \n");
    if (ptr == NULL) {
        return;
    }
    printf("large: %d\nmiddle: %d\nsmall: %d\n", ptr->large, ptr->middle, ptr->small);
    printf("version: %s\n", ptr->version);
}

int main()
{
    const char *json_str = "{\"Version\":\"1.0.0\", \"Large\": 1, \"Middle\": 0, \"Small\": 0}";
    isula_version *ptr = NULL;
    parser_error err = NULL;
    char *marshaled = NULL;

    // step 1: unmarshal
    ptr = isula_version_parse_data(json_str, NULL, &err);
    if (ptr == NULL) {
        return -1;
    }
    show_isula_version(ptr);

    // step 2: marshal
    free(ptr->version);
    ptr->version = strdup("2.0.0");
    ptr->large = 2;
    ptr->middle = 1;
    ptr->small = 1;
    marshaled = isula_version_generate_json(ptr, NULL, &err);
    if (ptr == NULL) {
        goto out;
    }
    printf("marshal isula version:\n\t%s\n", marshaled);

out:
    free(marshaled);
    free_isula_version(ptr);
    return 0;
}
```

The result is as follows:

```bash
$ ./a.out 
iSula version: 
large: 1
middle: 0
small: 0
version: 1.0.0
marshal isula version:
	{
    "Version": "2.0.0",
    "Large": 2,
    "Middle": 1,
    "Small": 1
}
```

### Defects  

Using libocispec, you can implement marshaling and unmarshaling similar to those in high-level languages. You only need to write a schema file, which greatly improves efficiency and ensures the code quality with the support of the open source community. However, there are still some defects.  

For example, in the Go language, the marshaled struct can be saved as a **map[string]interface{}** structure to record the complete information of the JSON string. However now, JSON strings can be parsed only based on schemas. In this case, information may be lost. In some scenarios, the specifications, such as the CNI, specify only the JSON structure of the body and supports extended configurations.  

## Near-Hot Weapon Era  

To solve the problem and transfer the original data completely, we use the scheme of recording the original element tree in the struct. The recorded element information is parsed during marshaling, so that the original information is not lost during unmarshaling.  

For details about the scheme, see the official PR at [https://github.com/containers/libocispec/pull/56](https://github.com/containers/libocispec/pull/56).  

### Usage

The usage is similar to the preceding method. The differences are as follows:  

1. The generated code is partially different (`_residual`).  

    ```c
    $ cat isula_version.h 
    ... ....
    typedef struct {
        char *version;
    
        int32_t large;
    
        int32_t middle;
    
        int32_t small;
    
        yajl_val _residual;
    }
    isula_version;
    ... ....
    ```

2. During parsing, you need to set `struct parser_context` to `OPT_PARSE_FULLKEY`.  

    ```c
    $ cat test.c 
    #include "isula_version.h"
    #include <stdio.h>
    
    void show_isula_version(const isula_version *ptr)
    {
        printf("iSula version: \n");
        if (ptr == NULL) {
            return;
        }
        printf("large: %d\nmiddle: %d\nsmall: %d\n", ptr->large, ptr->middle, ptr->small);
        printf("version: %s\n", ptr->version);
    }
    
    int main()
    {
        const char *json_str = "{\"Version\":\"1.0.0\", \"Large\": 1, \"Middle\": 0, \"Small\": 0, \"resi_int\": 1, \"resi_str\": \"test\"}";
        isula_version *ptr = NULL;
        parser_error err = NULL;
        char *marshaled = NULL;
        struct parser_context ctx;
        ctx.options = OPT_PARSE_FULLKEY;
    
        // step 1: unmarshal
        ptr = isula_version_parse_data(json_str, &ctx, &err);
        if (ptr == NULL) {
            return -1;
        }
        show_isula_version(ptr);
    
        // step 2: marshal
        free(ptr->version);
        ptr->version = strdup("2.0.0");
        ptr->large = 2;
        ptr->middle = 1;
        ptr->small = 1;
        marshaled = isula_version_generate_json(ptr, &ctx, &err);
        if (ptr == NULL) {
            goto out;
        }
        printf("marshal isula version:\n\t%s\n", marshaled);
    
    out:
        free(marshaled);
        free_isula_version(ptr);
        return 0;
    }
    ```

3. The result is as follows:  

    ```bash
    $ ./a.out 
    iSula version: 
    large: 1
    middle: 0
    small: 0
    version: 1.0.0
    marshal isula version:
    	{
        "Version": "2.0.0",
        "Large": 2,
        "Middle": 1,
        "Small": 1,
        "resi_int": 1,
        "resi_str": "test"
    }
    ```

You can see that the extended information is completely transferred. **This method adds the support for CNI extended configurations, and further solves the technical bottleneck for iSulad to dynamically support multiple plugins.**  

### Defects

The function of this method is basically the same as that implemented by languages that support reflection, but there are still some defects. For example, it is troublesome to dynamically modify data in a JSON structure. You need to be familiar with the underlying parsing libraries.  

## Summary

Although the current framework still has some defects, it enables container engines to use JSON. The last method can fully meet the current requirements of iSulad.  

Therefore, no further optimization is required. If you have requirements in subsequent application scenarios, go to the [libocispec community](https://github.com/containers/libocispec) for further optimization.

# References

- [https://github.com/containers/libocispec](https://github.com/containers/libocispec)  
- [http://json-schema.org/](http://json-schema.org/)  
- [https://github.com/lloyd/yajl/tree/master/example](https://github.com/lloyd/yajl/tree/master/example)  
