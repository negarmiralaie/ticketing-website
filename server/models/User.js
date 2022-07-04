const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    name:{ 
        type: String,
        required: true,
        maxlength: 32,
        trim: true
    },
    familyName:{
        type: String,
        required: true,
        maxlength: 32,
        trim: true    
    },
    phoneNumber:{
        type: String,
        required: true,
        lowercase: true,
        length: 11,
        unique: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
    },
    isVerified:{
        type: String,
        default: false,
    },
    date:{
        type: Date,
        default: Date.now()
    },
    verificationId:{
        type: String
    },
    roles:[{
        type: Array,
        default: "user"
    }],
    tickets:[{
        type: mongoose.Types.ObjectId,
        ref: "ticket"
    }]
});

UserSchema.pre("save", async function(next){
    try{
        if(this.isModified("password")){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this.password, salt);
            this.password = hashedPassword;
            next();
        }
        next();
    } catch (error){
        next(error);
    }
});

UserSchema.methods = {
    isValidPassword: async function (password) {
        try{
            return await bcrypt.compare(password, this.password);
         } catch(error) {
             throw error;
         }
    }
}

const User = mongoose.model('User', UserSchema);

module.exports = User;