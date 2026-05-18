#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { kubectl, ghPrComment, log, ghaNotice, sleep } from './lib/kubectl.js';
import { resolvePr, parseIssueFromBranch } from './lib/github.js';
import { renderTemplate, stripEmptyTlsSecret, resolveTemplate } from './lib/render.js';

const NAMESPACE = process.env.PREVIEW_NAMESPACE || 'ai-test';
const DOMAIN = process.env.PREVIEW_DOMAIN || 'ai.test.osinfra.cn';
const SLUG = process.env.PREVIEW_SLUG || 'portal';
const IMAGE = process.env.PREVIEW_IMAGE || 'ghcr.io/opensourceways-test/opencode-dev:latest';
const INGRESS_CLASS = process.env.PREVIEW_INGRESS_CLASS || 'nginx';
const TLS_SECRET = process.env.PREVIEW_TLS_SECRET || '';
const HEALTH_PORT = process.env.PREVIEW_PORT || '5173';
const HEALTH_PATH = process.env.PREVIEW_HEALTH_PATH || '/';

// VitePress allowedHosts patch（pod 内执行）：
// 在 app/.vitepress/config.ts 的 `vite: {` 后注入 server.allowedHosts:true + host:'0.0.0.0'，
// 然后 git update-index --skip-worktree 防止后续 git reset --hard 还原导致 403。
// 单行 bash 表达式，渲染进 ${VITE_PATCH}。
const VITEPRESS_ALLOWEDHOSTS_PATCH =
  `( node -e 'const fs=require("fs"),p="app/.vitepress/config.ts";` +
  `let s=fs.readFileSync(p,"utf8");` +
  `if(!s.includes("allowedHosts")){` +
  `s=s.replace(/vite:\\s*\\{/,"vite: { server: { allowedHosts: true, host: \\"0.0.0.0\\" },");` +
  `fs.writeFileSync(p,s)}' && ` +
  `git update-index --skip-worktree app/.vitepress/config.ts 2>/dev/null || true )`;

const _RESULT = {};

function setResult(key, value) {
  _RESULT[key] = value;
}

function dumpResult(filePath, extra) {
  if (!filePath) return;
  const data = { ..._RESULT, ...(extra || {}) };
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
  } catch (e) {
    log(`(写 --result-file ${filePath} 失败: ${e.message})`);
  }
}

function previewSelector(slug, issue) {
  return `app=preview,repo=${slug},pr=${issue}`;
}

function resourceName(slug, issue) {
  return `preview-${slug}-issue-${issue}`;
}

function ingressHost(slug, issue) {
  return `${slug}-issue-${issue}.${DOMAIN}`;
}

async function collectFailure(ns, name, slug, issue) {
  const sel = previewSelector(slug, issue);
  const parts = [
    `### 🔻 部署失败诊断 — \`${name}\` (ns=\`${ns}\`, selector \`${sel}\`)`,
  ];
  let r = await kubectl(['get', 'pods', '-l', sel, '-o', 'wide'], { ns });
  if (r.stdout.trim()) parts.push('```\n' + r.stdout.trim() + '\n```');
  for (const kind of ['deployment', 'pod']) {
    r = await kubectl(['describe', kind, '-l', sel], { ns });
    const block = (r.stdout || r.stderr || '').trim();
    if (block) {
      parts.push(
        `<details><summary>kubectl describe ${kind}</summary>\n\n\`\`\`\n${block.slice(-4000)}\n\`\`\`\n</details>`
      );
    }
  }
  let logs = '';
  r = await kubectl(
    ['logs', `deployment/${name}`, '--all-containers=true', '--tail=200', '--prefix=true'],
    { ns }
  );
  if (r.stdout.trim()) {
    logs = r.stdout;
  } else {
    const pr2 = await kubectl(['get', 'pods', '-l', sel, '-o', 'name'], { ns });
    for (const p of pr2.stdout.split('\n')) {
      if (!p.trim()) continue;
      const lr = await kubectl([
        'logs',
        p.trim(),
        '--all-containers=true',
        '--tail=200',
      ], { ns });
      logs += lr.stdout || lr.stderr || '';
    }
  }
  if (logs.trim()) {
    parts.push(
      `<details><summary>kubectl logs (tail 200)</summary>\n\n\`\`\`\n${logs.trim().slice(-6000)}\n\`\`\`\n</details>`
    );
  }
  const ev = await kubectl(['get', 'events', '--sort-by=.lastTimestamp'], { ns });
  const evLines = ev.stdout.split('\n').filter((ln) => ln.includes(name));
  if (evLines.length) {
    parts.push(
      `<details><summary>相关 events</summary>\n\n\`\`\`\n${evLines.slice(-40).join('\n')}\n\`\`\`\n</details>`
    );
  }
  return parts.join('\n\n');
}

async function waitHealthy(ns, slug, issue, { tries = 90, interval = 5 } = {}) {
  const sel = previewSelector(slug, issue);
  for (let i = 1; i <= tries; i++) {
    const r = await kubectl(
      [
        'get',
        'pods',
        '-l',
        sel,
        '--field-selector=status.phase=Running',
        '-o',
        'jsonpath={range .items[*]}{.metadata.name}{"\\n"}{end}',
      ],
      { ns }
    );
    const pods = r.stdout.split('\n').filter((p) => p.trim());
    if (pods.length) {
      const pod = pods[0];
      const cr = await kubectl(
        [
          'exec',
          pod,
          '--',
          'bash',
          '-c',
          `curl -sS -o /dev/null -m 3 -w '%{http_code}' http://localhost:${HEALTH_PORT}${HEALTH_PATH} 2>/dev/null || echo X`,
        ],
        { ns }
      );
      const code = (cr.stdout.trim().split('\n').pop() || 'X').trim();
      log(`  poll[${i * interval}s] ${pod} -> ${code}`);
      if (code === '200') return true;
    } else {
      log(`  poll[${i * interval}s] (no running pod for selector ${sel})`);
    }
    await sleep(interval * 1000);
  }
  return false;
}

async function devPodIncrementalUpdate(ns, name, branch, slug, issue) {
  const sel = previewSelector(slug, issue);
  const r = await kubectl(
    [
      'get',
      'pods',
      '-l',
      sel,
      '--field-selector=status.phase=Running',
      '-o',
      'jsonpath={.items[*].metadata.name}',
    ],
    { ns }
  );
  const running = r.stdout.split(/\s+/).filter(Boolean);
  if (!running.length) {
    await kubectl(['rollout', 'status', `deployment/${name}`, '--timeout=480s'], { ns });
    return;
  }
  const pod = running[0];
  const hg = await kubectl(
    ['exec', pod, '--', 'bash', '-c', '[ -d /tmp/app/.git ] && echo yes || echo no'],
    { ns }
  );
  if (hg.stdout.trim() !== 'yes') {
    ghaNotice(`pod ${pod} 内无 /tmp/app/.git，rollout restart 兜底`);
    await kubectl(['rollout', 'restart', `deployment/${name}`], { ns });
    await kubectl(['rollout', 'status', `deployment/${name}`, '--timeout=480s'], { ns });
    return;
  }
  ghaNotice(`pod ${pod} 已 running，exec git pull 增量更新（vite HMR）`);
  const cmd =
    `cd /tmp/app && git fetch origin '${branch}' 2>&1 | tail -3 && ` +
    `git reset --hard origin/'${branch}' 2>&1 | tail -3 && ` +
    `(${VITEPRESS_ALLOWEDHOSTS_PATCH}) && ` +
    `(git diff HEAD@{1} HEAD -- package.json pnpm-lock.yaml 2>/dev/null | grep -q '^[+-]' ` +
    `&& (echo '== deps changed, pnpm install =='; pnpm install --no-frozen-lockfile 2>&1 | tail -5) || true)`;
  await kubectl(['exec', pod, '--', 'bash', '-c', cmd], { ns });
  await sleep(5000);
}

async function cmdDeploy(args) {
  const token = process.env.GH_TOKEN || '';
  if (!token) log('⚠️ 未设置 GH_TOKEN，访问私有仓 / 评论会失败');
  const prInfo = await resolvePr(args.repo, args.pr, token);
  const issue = parseIssueFromBranch(prInfo.branch, args.pr);
  const slug = SLUG;
  const ns = NAMESPACE;
  const name = resourceName(slug, issue);
  const host = ingressHost(slug, issue);
  const previewUrl = `https://${host}/`;

  ghaNotice(
    `deploy ${args.repo}#${args.pr} branch=${prInfo.branch} -> ${name} (ns=${ns}, host=${host})`
  );

  // 1) 建 per-PR clone-token Secret（token 不进 pod env）
  const cloneToken = process.env.PREVIEW_CLONE_TOKEN || token;
  const cloneSecret = `${name}-clone`;
  if (cloneToken) {
    const sy =
      `apiVersion: v1\nkind: Secret\nmetadata:\n  name: ${cloneSecret}\n  namespace: ${ns}\n` +
      `  labels:\n    app: preview\n    repo: "${slug}"\n    pr: "${issue}"\n    managed-by: pr-preview\n` +
      `type: Opaque\nstringData:\n  token: "${cloneToken}"\n`;
    const r = await kubectl(['apply', '-f', '-'], { ns, input: sy });
    log(r.stdout + r.stderr);
  }

  // 2) 渲染并 apply 主 manifest
  const mapping = {
    NAME: name,
    NAMESPACE: ns,
    SLUG: slug,
    ISSUE: issue,
    REPO_FULL: args.repo,
    BRANCH: prInfo.branch,
    SHA: prInfo.sha,
    IMAGE,
    REPO_CLONE_URL: prInfo.cloneUrl,
    CLONE_SECRET: cloneSecret,
    HEALTH_PATH,
    HEALTH_PORT,
    INGRESS_HOST: host,
    INGRESS_CLASS,
    TLS_SECRET,
    VITE_PATCH: VITEPRESS_ALLOWEDHOSTS_PATCH,
  };
  let manifest = renderTemplate(resolveTemplate('vite-dev'), mapping);
  if (!TLS_SECRET) manifest = stripEmptyTlsSecret(manifest);

  const ar = await kubectl(['apply', '-f', '-'], { ns, input: manifest });
  log(ar.stdout + ar.stderr);
  if (ar.rc !== 0) {
    const report = `❌ \`${name}\` apply manifest 失败:\n\`\`\`\n${ar.stderr.trim().slice(-3000)}\n\`\`\``;
    setResult('ready', 'false');
    setResult('preview_url', previewUrl);
    setResult('report', report);
    setResult('issue', issue);
    setResult('slug', slug);
    setResult('name', name);
    return 1;
  }

  // 3) 增量更新（如果已有 running pod）
  await devPodIncrementalUpdate(ns, name, prInfo.branch, slug, issue);

  // 4) 等健康
  const ready = await waitHealthy(ns, slug, issue);
  await sleep(3000);
  setResult('ready', ready ? 'true' : 'false');
  setResult('preview_url', previewUrl);
  setResult('issue', issue);
  setResult('slug', slug);
  setResult('name', name);
  setResult('ingress_host', host);

  if (ready) {
    const report =
      `✅ 预览就绪：**${previewUrl}** （\`${name}\` @ ns \`${ns}\`，` +
      `分支 \`${args.repo}@${prInfo.branch}\`，issue \`#${issue}\`，` +
      `ingress \`${INGRESS_CLASS}\` host \`${host}\`）`;
    ghaNotice(`preview ready: ${previewUrl}`);
    setResult('report', report);
    return 0;
  }
  const sel = previewSelector(slug, issue);
  const report =
    `⚠️ 预览 pod 健康检查未通过（\`${name}\`，期望访问 ${previewUrl}）\n\n` +
    (await collectFailure(ns, name, slug, issue)) +
    `\n\n排查：\`kubectl -n ${ns} get pod,svc,ingress -l '${sel}'\``;
  setResult('report', report);
  return 1;
}

async function cmdStatus(args) {
  const token = process.env.GH_TOKEN || '';
  const prInfo = await resolvePr(args.repo, args.pr, token);
  const issue = parseIssueFromBranch(prInfo.branch, args.pr);
  const slug = SLUG;
  const ns = NAMESPACE;
  const host = ingressHost(slug, issue);
  const sel = previewSelector(slug, issue);
  const r = await kubectl(['get', 'deploy,svc,ingress,pod', '-l', sel, '-o', 'wide'], { ns });
  process.stdout.write(r.stdout || r.stderr);
  process.stdout.write(`preview_url=https://${host}/\n`);
  setResult('preview_url', `https://${host}/`);
  setResult('issue', issue);
  setResult('slug', slug);
  setResult('name', resourceName(slug, issue));
  return 0;
}

async function cmdCleanup(args) {
  const token = process.env.GH_TOKEN || '';
  let issue;
  try {
    const prInfo = await resolvePr(args.repo, args.pr, token);
    issue = parseIssueFromBranch(prInfo.branch, args.pr);
  } catch (e) {
    // PR 已关闭 / 删除时 GitHub 仍能取到，理论不会 fail；兜底用 PR 号
    log(`(取 PR 信息失败，回退 PR 号: ${e.message})`);
    issue = String(args.pr);
  }
  const slug = SLUG;
  const ns = NAMESPACE;
  const name = resourceName(slug, issue);
  const sel = previewSelector(slug, issue);
  for (const kind of ['ingress', 'deployment', 'service', 'job', 'pod', 'secret']) {
    const r = await kubectl(
      ['delete', kind, '-l', sel, '--ignore-not-found', '--timeout=60s'],
      { ns }
    );
    log(r.stdout + r.stderr);
  }
  for (const kind of ['ingress', 'deployment', 'service', 'pod']) {
    await kubectl(['delete', kind, name, '--ignore-not-found', '--timeout=60s'], { ns });
  }
  await kubectl(['delete', 'secret', `${name}-clone`, '--ignore-not-found', '--timeout=60s'], { ns });
  ghaNotice(`cleanup done: ${args.repo}#${args.pr} issue=${issue} (${sel})`);
  setResult('ready', 'cleanup');
  setResult('preview_url', '');
  setResult('issue', issue);
  setResult('slug', slug);
  setResult('name', name);
  setResult('report', `🧹 已清理预览资源 \`${name}\`（selector \`${sel}\`）`);
  return 0;
}

function parseCli(argv) {
  const [, , cmd, ...rest] = argv;
  if (!cmd || !['deploy', 'cleanup', 'status'].includes(cmd)) {
    process.stderr.write(
      'usage: pr-preview.js <deploy|cleanup|status> --pr <N> --repo <owner/name> [--result-file <path>]\n'
    );
    process.exit(2);
  }
  const { values } = parseArgs({
    args: rest,
    options: {
      pr: { type: 'string' },
      repo: { type: 'string' },
      'result-file': { type: 'string', default: '' },
    },
    strict: true,
  });
  if (!values.pr || !values.repo) {
    process.stderr.write('--pr 和 --repo 必填\n');
    process.exit(2);
  }
  return { cmd, pr: values.pr, repo: values.repo, resultFile: values['result-file'] || '' };
}

async function main() {
  const args = parseCli(process.argv);
  if (!process.env.KUBECONFIG && !fs.existsSync('/var/run/secrets/kubernetes.io/serviceaccount/token')) {
    log('⚠️ 未设置 KUBECONFIG，kubectl 将用默认上下文');
  }
  let rc = 0;
  try {
    if (args.cmd === 'deploy') rc = await cmdDeploy(args);
    else if (args.cmd === 'status') rc = await cmdStatus(args);
    else if (args.cmd === 'cleanup') rc = await cmdCleanup(args);
  } catch (e) {
    const msg = `❌ pr-preview ${args.cmd} 异常: ${e.message}`;
    log(msg);
    setResult('ready', 'false');
    setResult('report', msg);
    rc = 2;
  }
  dumpResult(args.resultFile, { repo: args.repo, pr: args.pr, exit_code: rc });
  process.exit(rc);
}

main();
