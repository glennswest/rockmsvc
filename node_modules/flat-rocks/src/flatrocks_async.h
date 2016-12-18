/* Copyright (c) 2012-2016 LevelDOWN contributors
 * See list at <https://github.com/level/leveldown#contributing>
 * MIT License <https://github.com/level/leveldown/blob/master/LICENSE.md>
 */

#ifndef LD_FLATROCKS_ASYNC_H
#define LD_FLATROCKS_ASYNC_H

#include <node.h>

#include "async.h"

namespace flat_rocks {

class DestroyWorker : public AsyncWorker {
public:
  DestroyWorker (
      Nan::Utf8String* location
    , Nan::Callback *callback
  );

  virtual ~DestroyWorker ();
  virtual void Execute ();

private:
  Nan::Utf8String* location;
};

class RepairWorker : public AsyncWorker {
public:
  RepairWorker (
      Nan::Utf8String* location
    , Nan::Callback *callback
  );

  virtual ~RepairWorker ();
  virtual void Execute ();

private:
  Nan::Utf8String* location;
};

} // namespace flat_rocks

#endif
