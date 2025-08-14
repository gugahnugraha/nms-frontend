# Steps to Create a GitHub Repository and Push Code

Here are the steps to create a new GitHub repository and upload the NMS Frontend code that we have prepared:

## 1. Creating a New GitHub Repository

1. Open [GitHub](https://github.com/) and log in to your account
2. Click the "+" button in the top right, then select "New repository"
3. Fill in the repository information:
   - Repository name: `nms-frontend` (or another name of your choice)
   - Description: Network Monitoring System Frontend Application
   - Visibility: Public (or Private if you want to maintain privacy)
   - Select "Initialize this repository with a README" if you want GitHub to create a basic README
   - Click "Create repository"

## 2. Connecting the Local Repository with GitHub

After the GitHub repository is created, you will see a page with instructions. Use the following commands in your terminal to connect the local repository with GitHub:

```bash
# Adding the remote repository
git remote add origin https://github.com/gugahnugraha/nms-frontend.git

# Pushing code to the GitHub repository
git push -u origin main
```

Be sure to replace `gugahnugraha/nms-frontend.git` with your GitHub username and repository name.

## 3. Verification

1. After the push process is complete, refresh your GitHub repository page
2. You will see all project files are now available on GitHub
3. README.md and INTEGRATION.md will be displayed on the repository's main page

## 4. Next Steps

- Activate GitHub Pages if you want to create an online demo (Settings > Pages)
- Add collaborators if you are working in a team
- Create issues to track features that need to be developed
- Create a separate development branch for continuous development

Congratulations! Your NMS Frontend repository is now available on GitHub and ready to be used or further developed.
