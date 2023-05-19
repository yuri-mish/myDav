
import etag from 'etag';
import { CallbackError, Document, Model, Schema } from 'mongoose';
import { ObjectId } from 'mongoose';

module.exports = exports = tree;

type TOptions = {
  pathSeparator?: string;
  pathTextProp: string;
}

export const  TreeTypeProps = {
  path: {type: String, readonly:true, index:true},
  pathText:{type: String, readonly:true, index:true },
  parent: { type: Schema.Types.ObjectId, index: true,
      ref:'treefs'
  },
}

export default function tree(schema: Schema<any>, options: TOptions) {
  let pathSeparator = options && options.pathSeparator || '#';
  let pathTextProp = options && options.pathTextProp || 'name';

  schema.add({
    parent: {
      type: Schema.Types.ObjectId,
      index: true
    },
    path: {
      type: String,
      index: true
    },
    _id: Schema.Types.ObjectId
  });

  schema.pre('save', async function (next) {
    let isParentChange = this.isModified('parent');

    if (this.isNew || isParentChange) {
      if (!this.parent) {
        this.path = this._id?.toString();
        this.pathText = this[pathTextProp].toString();
        return next();
      }

      let self = this;
      const parentDoc = await this.collection.findOne({ _id: this.parent }).catch(err => next(err));

      let previousPath = self.path;
      let previousPathText = self.pathText;
      self.path = parentDoc?.path + pathSeparator + self._id?.toString();
      self.pathText = (parentDoc?.pathText==='/'?'':parentDoc?.pathText) + '/' + self.props.displayname;

      if (isParentChange) {
          // When the parent is changed we must rewrite all children paths as well
          const cursor = await self.collection.find({ path: { '$regex': '^' + previousPath + pathSeparator } });
          let stream = cursor.stream();
          stream.on('data', function (doc: { path: string; _id: any;[pathTextProp: string]: string }) {
            let newPath = self.path + doc.path.substr(previousPath.length);
            let newPathText = self.pathText + doc.pathText.substr(previousPathText.length);
            self.collection.updateOne({ _id: doc._id, }, { $set: { path: newPath, pathText: newPathText } })
              .catch(err => next(err))
          });
          stream.on('close', function () {
            next();
          });
          stream.on('end', function () {
            next();
          });
          stream.on('error', function (err: CallbackError | undefined) {
            next(err);
          });
        } else {
          next();
     }
    await self.collection.updateOne({ _id: parentDoc?._id, }, { $set: { 'props.getetag': etag(JSON.stringify(parentDoc)) } });
    next();
    }
  });

  // schema.pre('deleteOne', function (next) {
  //   const path = this.get("path");
  //   const collection = this.get("collection");
  //   if (!path) {
  //     return next();
  //   }
  //   // collection.remove({ path: { '$regex': '^' + path + pathSeparator } }, next);
  // });

  // schema.method('getChildren', function (recursive, cb) {
  //   if (typeof (recursive) === "function") {
  //     cb = recursive;
  //     recursive = false;
  //   }
  //   var filter = recursive ? { path: { $regex: '^' + this.path + pathSeparator } } : { parent: this._id };
  //   return this.model(this.constructor.modelName).find(filter, cb);
  // });

  // schema.method('getParent', function (cb) {
  //   return this.model(this.constructor.modelName).findOne({ _id: this.parent }, cb);
  // });

  // var getAncestors = function(cb: any) {
  //   if(this.path) {
  //     var ids = this.path.split(pathSeparator);
  //     ids.pop();
  //   } else {
  //     var ids = [];
  //   }
  //   var filter = { _id : { $in : ids } };
  //   return this.model(this.constructor.modelName).find(filter, cb);
  // };

  // schema.method('getAnsestors', getAncestors);
  // schema.method('getAncestors', getAncestors);

  schema.virtual('level').get(function () {
    return this.path ? this.path.split(pathSeparator).length : 0;
  });
}
