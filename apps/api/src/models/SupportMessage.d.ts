import mongoose from "mongoose";
export interface ISupportMessage extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    subject: string;
    message: string;
    status: "pending" | "in_review" | "completed";
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISupportMessage, {}, {}, {}, mongoose.Document<unknown, {}, ISupportMessage, {}, mongoose.DefaultSchemaOptions> & ISupportMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISupportMessage>;
export default _default;
//# sourceMappingURL=SupportMessage.d.ts.map