cd rocksdb
git submodule init
git submodule update
make static_lib
make shared_lib
make install -e INSTALL_PATH=/usr
cd ..
git add librocksdb.a

