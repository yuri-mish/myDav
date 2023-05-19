import mongoose, { InferSchemaType, Model, Schema, Types } from "mongoose";
import { Request } from "express";
import etag from 'etag';
import tree, { TreeTypeProps } from "../../../lib/mong-tree/tree";
import { davPathType } from "../../../types";
import { dirname } from "path";
import { userInfo } from "os";
import { dbUserSchema } from "./users";

// import { path } from 'node:path';

interface IisCollection {
  'collection': {}
};


export const TreeFSSchema = new Schema({
  ...TreeTypeProps,
  filename: String,
  isFile: Boolean,
  size: Number,
  owner: {type: Types.ObjectId, ref:'dbuser', index: true },
  ownerroot: String,
  createDate: { type: Date, required: true },
  contentType: String,
  props: {
    type: {
      displayname: String,
      getlastmodified: String,
      creationdate: String,
      resourcetype: Schema.Types.Mixed,
      getetag: String,
      getcontentlength: Number,
      getcontenttype: String,
    }, required: true
  },
},
  // {
  //   methods:{
  //     delete: function(devPath){
  //       console.log(11111111111);
  //     }
  //   }
  // }
);

TreeFSSchema.pre('save', function (next) {
  this._id = this._id ?? new mongoose.mongo.ObjectId();
  this.props.resourcetype = this.isFile ? '' : { collection: '' };
  this.props.getetag = etag(JSON.stringify(this));
  this.props.getlastmodified = this.props.getlastmodified ?? this.createDate.toUTCString();
  next();
})

TreeFSSchema.post('save', function(next) {

  console.log(111);
});

export type TFile = InferSchemaType<typeof TreeFSSchema>;
interface IFileMethods extends Model<TFile> {
  delete(devPath:davPathType): string;
}
type FileMethods = Model<TFile, {}, IFileMethods>;


TreeFSSchema.plugin(tree, { pathTextProp: 'filename' });

export const TreeFS = mongoose.model<TFile, FileMethods>('treefs', TreeFSSchema);

TreeFSSchema.method('delete', async function (devPath: davPathType, req:Request) {
  if (devPath.filename) {
    await TreeFS.deleteOne({ pathText: devPath.path, owner: req.user._id } ).exec()
    console.log(this)
  } else {
    const dirName = devPath.dir.substring(0, devPath.dir.length - 1);
    const dir = await TreeFS.findOne({ pathText: dirName, owner: req.user._id });
    const reg = new RegExp('^' + dir?.path);
    const files = await TreeFS.find({ path: reg });
    await TreeFS.deleteMany({ path: reg }).exec();
  }

  return devPath.path;
})
