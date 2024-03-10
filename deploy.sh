#!/bin/bash

# Get current directory
CURRENT_DIR=$(pwd)

# Change directory to the project directory
cd /Users/nicolascastro/Development/url-ai-analysis || exit

# Create deploy directory if it doesn't exist
mkdir -p deploy

# Change directory to deploy
cd deploy || exit

# Check if the user wants to deploy all branches or specific ones
if [ "$1" == "all" ]; then
    # Get all branch names
    branches=$(git branch --format='%(refname:short)')
else
    # Prompt the user to select branches to deploy
    echo "Select the number of the branch(es) to deploy (comma-separated):"
    git branch --format='%(refname:short)' | cat -n
    read -rp "Branches: " input

    # Convert input to an array of branch names
    IFS=',' read -ra branch_numbers <<<"$input"
    branches=()
    for branch_number in "${branch_numbers[@]}"; do
        branch_name=$(git branch --format='%(refname:short)' | sed -n "${branch_number}p")
        branches+=("$branch_name")
    done
fi

# Loop through each selected branch
for branch in "${branches[@]}"; do
    echo ""
    echo ""
    echo "Deploying branch: $branch"

    # Checkout the branch
    echo ""
    echo "Switching to branch: $branch"
    git checkout "$branch"
    
    # Convert branch name to a valid directory name
    branch_dir=$(echo "$branch" | tr '/' '-')

    # Create directory for the branch if it doesn't exist
    mkdir -p "$branch_dir"

    echo ""
    echo "Branch target deploy dir is: $branch_dir"

    # Change directory to the branch directory
    cd "$branch_dir" || exit

    echo ""
    echo "copying files $branch to $branch_dir"
    rsync -av --exclude='.env' --exclude='deploy.sh' --exclude='.git' --exclude='.gitignore' --exclude='deploy' --exclude='node_modules' --exclude='package-lock.json' ../../ .

    # Check if branch-specific .env file exists, if so, copy it as .env
    if [ -f "../../${branch//-/}.env" ]; then
        cp "../../${branch//-/}.env" .env
        echo ".env file copied"
    else
        echo "No .env file found for branch: $branch"
    fi

     # Clear npm cache in the target branch directory
    echo ""
    echo "Cleaning npm cache in $branch_dir"
    npm cache clean --force || true  # Use `|| true` to prevent script failure if cache clean fails

    # Install dependencies
    echo ""
    echo "running install --force"
    NODE_PATH="./node_modules" npm install --force

    echo "Content copied to: $CURRENT_DIR/deploy/$branch_dir"
    echo "Deployed branch: $branch"

    # Change directory back to the deploy directory
    cd ..
done

# Change directory back to the original directory
cd "$CURRENT_DIR" || exit

# Checkout frontend branch
git checkout frontend

echo "Deployed the following branches:"
echo "${branches[*]}"
