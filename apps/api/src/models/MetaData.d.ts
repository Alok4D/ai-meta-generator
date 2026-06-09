import mongoose, { Document } from 'mongoose';
export interface IMetaData extends Document {
    user: mongoose.Types.ObjectId;
    imageUrl: string;
    title: string;
    category: string;
    keywords: string[];
}
declare const _default: mongoose.Model<IMetaData, {}, {}, {}, mongoose.Document<unknown, {}, IMetaData, {}, mongoose.DefaultSchemaOptions> & IMetaData & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMetaData>;
export default _default;
//# sourceMappingURL=MetaData.d.ts.map