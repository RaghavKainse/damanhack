import { execSync } from 'child_process';
import fs from 'fs';

// 1. Get Token from Git Credential Manager
const cred = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n' }).toString();
const tokenLine = cred.split('\n').find(l => l.startsWith('password='));
const token = tokenLine ? tokenLine.replace('password=', '').trim() : '';

if (!token) {
  console.error('No GitHub token found in Git Credential Manager.');
  process.exit(1);
}

// 2. Remove temporary files before staging
const filesToRemove = [
  'check_all_games.js',
  'check_cors.js',
  'check_cors2.js',
  'check_domains.js',
  'check_game_state.js',
  'check_wayback.js',
  'extract_ldb.js',
  'find_ee_he.js',
  'find_update_pred_all.js',
  'find_vars.js',
  'harvest_draws.js',
  'inspect_lottery_api.js',
  'read_main_vue.js',
  'read_wingo_js.js',
  'scratch_check_paths.js',
  'scratch_fetch_all.js',
  'scratch_find_baseurl.js',
  'scratch_find_edge.js',
  'scratch_find_html_apis.js',
  'scratch_find_methods.js',
  'scratch_find_port.js',
  'scratch_find_scripts.js',
  'scratch_find_storage.js',
  'scratch_find_wingo_apis.js',
  'scratch_probe_endpoints.js',
  'scratch_search_apis.js',
  'scratch_search_wingo.js',
  'search_bet_amount_api.js',
  'test_benchmark.js',
  'test_calibrated_eval2.js',
  'test_engine.js',
  'test_gh.js',
  'test_h5_api.js',
  'test_post.js',
  'test_smooth.js',
  'test_sync.js',
  'test_timer.js',
  'test_trend_stats.js'
];

filesToRemove.forEach(f => {
  if (fs.existsSync(f)) {
    try {
      fs.unlinkSync(f);
      console.log('Removed temp file:', f);
    } catch {}
  }
});

// 3. Write production vercel.json if not present
if (!fs.existsSync('vercel.json')) {
  const vercelConfig = {
    rewrites: [
      {
        source: "/draw-api/:path*",
        destination: "https://draw.ar-lottery06.com/:path*"
      },
      {
        source: "/(.*)",
        destination: "/index.html"
      }
    ]
  };
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('Created vercel.json for SPA routing and /draw-api proxy.');
}

// 4. Create repository on GitHub via API if it does not exist
async function ensureGitHubRepo() {
  const repoName = 'damanhack';
  console.log(`Checking if repository ${repoName} exists on GitHub...`);
  
  let exists = false;
  try {
    const checkRes = await fetch(`https://api.github.com/repos/RaghavKainse/${repoName}`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node-Fetch',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (checkRes.status === 200) {
      exists = true;
      console.log(`Repository RaghavKainse/${repoName} already exists on GitHub.`);
    }
  } catch (err) {
    console.error('Check repo error:', err.message);
  }

  if (!exists) {
    console.log(`Creating public repository RaghavKainse/${repoName} on GitHub...`);
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node-Fetch',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        description: 'Daman WinGo 30S AI Prediction & Real-Time Sync Engine',
        private: false,
        has_issues: true,
        has_projects: true,
        has_wiki: true
      })
    });
    const createData = await createRes.json();
    if (createRes.status === 201) {
      console.log(`Created GitHub repo: ${createData.html_url}`);
    } else {
      console.log('Create repo response:', createRes.status, createData.message);
    }
  }

  // 5. Initialize git, commit, and push
  console.log('Initializing local git repository...');
  try {
    if (!fs.existsSync('.git')) {
      execSync('git init -b main', { stdio: 'inherit' });
    } else {
      execSync('git branch -M main', { stdio: 'inherit' });
    }

    execSync('git config user.name "RaghavKainse"', { stdio: 'inherit' });
    execSync('git config user.email "raghavkainse@gmail.com"', { stdio: 'inherit' });

    execSync('git add .', { stdio: 'inherit' });
    
    try {
      execSync('git commit -m "Initial production release: Daman WinGo calibrated prediction & real-time sync engine"', { stdio: 'inherit' });
    } catch {
      console.log('Commit skipped (working tree clean).');
    }

    // Set remote origin with embedded token for authenticated push
    const remoteUrl = `https://RaghavKainse:${token}@github.com/RaghavKainse/${repoName}.git`;
    try {
      execSync('git remote remove origin', { stdio: 'ignore' });
    } catch {}
    
    execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
    
    console.log('Pushing to GitHub (origin main)...');
    execSync('git push -u origin main --force', { stdio: 'inherit' });
    
    // Reset remote URL to clean HTTPS (without token in plaintext)
    execSync(`git remote set-url origin https://github.com/RaghavKainse/${repoName}.git`, { stdio: 'inherit' });

    console.log(`\n🎉 SUCCESS! Pushed to GitHub: https://github.com/RaghavKainse/${repoName}`);
  } catch (gitErr) {
    console.error('Git command error:', gitErr.message);
  }
}

ensureGitHubRepo();
