sudo yum install git
git config user.name "glenn.west"
git config user.email "glennswest@neuralcloudcomputing.com"
sudo yum install gcc gcc-c++
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
echo <<'EOF' >> .bashrc
export NVM_DIR="/home/vagrant/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
EOF
source .bashrc
nvm install v6.9.2
