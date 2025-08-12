# GitHub Actions Workflows

## Deploy to GitHub Pages

The `deploy.yml` workflow automatically builds and deploys the Bias Cards application to GitHub Pages whenever changes are pushed to the main branch.

### How it works

1. **Trigger**: Runs automatically on push to `main` branch, or can be triggered manually from the Actions tab
2. **Build**: 
   - Sets up Node.js 20 and pnpm
   - Installs dependencies with frozen lockfile
   - Builds the Next.js static site with the correct base path
   - Outputs static files to the `out` directory
3. **Deploy**: 
   - Uploads the built site as an artifact
   - Deploys to GitHub Pages

### Setup Requirements

Before the workflow can run successfully, you need to:

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save the settings

2. **Add Required Secrets** for Google Drive integration:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add the following secrets:
     - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
     - `NEXT_PUBLIC_GOOGLE_DRIVE_SCOPE`: The Google Drive API scope (typically `https://www.googleapis.com/auth/drive.file`)
   
   Note: Even though these are "public" environment variables (prefixed with `NEXT_PUBLIC_`), 
   they should still be stored as secrets in GitHub to keep them out of your codebase.

3. **Ensure branch protection** (optional but recommended):
   - Protect the `main` branch to prevent accidental direct pushes
   - Require pull request reviews before merging

### Manual Deployment

You can also trigger the deployment manually:
1. Go to the Actions tab in your repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

### Monitoring Deployments

- Check the Actions tab for deployment status
- View deployment history in Settings → Pages
- The live site will be available at: `https://[your-username].github.io/bias-cards/`

### Troubleshooting

If the deployment fails:
1. Check the Actions tab for error messages
2. Ensure GitHub Pages is enabled in repository settings
3. Verify that the repository is public (or you have GitHub Pages enabled for private repos)
4. Check that all dependencies install correctly by running `pnpm install` locally