import { spawn } from 'node:child_process';

export function log(msg) {
  process.stderr.write(String(msg).replace(/\n+$/, '') + '\n');
}

export function ghaNotice(msg) {
  if (process.env.GITHUB_ACTIONS) process.stdout.write(`::notice::${msg}\n`);
  log(msg);
}

export function run(cmd, args, { input, env, check = false } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      env: env || process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => (stdout += d.toString('utf-8')));
    p.stderr.on('data', (d) => (stderr += d.toString('utf-8')));
    p.on('error', reject);
    p.on('close', (rc) => {
      if (check && rc !== 0) {
        reject(
          new Error(
            `command failed (${rc}): ${cmd} ${args.join(' ')}\nstdout: ${stdout}\nstderr: ${stderr}`
          )
        );
        return;
      }
      resolve({ rc, stdout, stderr });
    });
    if (input != null) {
      p.stdin.write(input);
    }
    p.stdin.end();
  });
}

export async function kubectl(args, { ns, input, check = false } = {}) {
  const full = [];
  if (ns != null) full.push('-n', ns);
  return run('kubectl', [...full, ...args], { input, check });
}

export async function ghApi(apiPath, { token, paginate = false, jq } = {}) {
  const args = ['api', apiPath];
  if (paginate) args.push('--paginate');
  if (jq) args.push('-q', jq);
  const env = { ...process.env };
  if (token) env.GH_TOKEN = token;
  const { rc, stdout, stderr } = await run('gh', args, { env });
  if (rc !== 0) {
    throw new Error(`gh api ${apiPath} failed: ${stderr.trim()}`);
  }
  return stdout;
}

export async function ghPrComment(repo, pr, bodyFile, { token } = {}) {
  const env = { ...process.env };
  if (token) env.GH_TOKEN = token;
  const { rc, stderr } = await run(
    'gh',
    ['pr', 'comment', String(pr), '--repo', repo, '--body-file', bodyFile],
    { env }
  );
  if (rc !== 0) log(`gh pr comment 失败: ${stderr.trim()}`);
  return rc === 0;
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
