# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "precise32"
  config.vm.box_url = "http://files.vagrantup.com/precise32.box"
  config.vm.network "forwarded_port", guest: 80, host: 8081
  #config.vm.network "forwarded_port", guest: 8000, host: 8000
  #config.vm.network "forwarded_port", guest: 8080, host: 8080

  config.vm.provision :shell, :inline => <<-SH
    
    echo "--- aptget update ---"
    sudo bash
    apt-get update

    echo "--- install openResty prequirements ---"
    apt-get install -y libreadline-dev libncurses5-dev libpcre3-dev libssl-dev perl make siege

    echo "--- install openresty ---"
    wget http://openresty.org/download/ngx_openresty-1.7.2.1rc1.tar.gz 
    tar xzvf ngx_openresty-1.7.2.1rc1.tar.gz
    cd ngx_openresty-1.7.2.1rc1/
    ./configure
    make
    make install

    echo "--- installing redis ---"
    add-apt-repository ppa:chris-lea/redis-server
    apt-get update
    apt-get install -y redis-server

    echo "--- installing git ---"
    apt-get install -y git-core

    echo "--- installing node.js ---"
    apt-get update
    apt-get install -y python-software-properties
    apt-get install -y python g++ make
    add-apt-repository -y ppa:chris-lea/node.js
    apt-get update
    apt-get install -y nodejs

    echo "--- install gulpjs ---"
    npm install -g gulp

    echo "--- clone project ---"
    cd /vagrant
    git clone https://github.com/tavikukko/todo-mvc.git

    echo "--- copy files & folders to nginx root---"
    cd todo-mvc
    cp -r app/ /usr/local/openresty/nginx/html/
    cp -r lua/ /usr/local/openresty/nginx/
    cp conf/nginx.conf /usr/local/openresty/nginx/conf/

    echo "--- start redis ---"
    redis-server &

    echo "--- start nginx ---"
    /usr/local/openresty/nginx/sbin/nginx

    echo "--- done ---"
    echo "--- browse to http://localhost:8081 ---"

  SH

end