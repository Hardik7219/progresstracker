const express = require('express')
const app = express()
const users = require('./models/user.Model')
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookies = require('cookie-parser')
const analys= require('./models/analys.Model')

app.use(cookies())
app.use(cors({
    origin: "http://localhost:5173", // your React app
    credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.get('/',(req,res)=>{
    console.log('running')
    res.send("hello")
})


app.post('/create', async (req, res) => {
    const { userName, email, password } = req.body;
    if(!userName || !email || !password)
        res.status(500).json({
                success: false,
                message: "Error creating user"
            });
    else
    {
    try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

                    const user = await users.create({
                        userName,
                        email,
                        password : hash
                    });
                    
                    res.json({
                        success: true,
                        message: "User created successfully",
                        user
                    });
            
        } catch (error) {
            console.error(error);
            
            res.status(500).json({
                success: false,
                message: "Error creating user"
            });
        }
    }
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing fields"
        });
    }

    try {
        const findUser = await users.findOne({ email });

        if (!findUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, findUser.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { id: findUser._id, email: findUser.email },
            "secret",{expiresIn : '7d'});

        res.cookie("token", token, {
            httpOnly: true,
            sameSite:"none",
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        
        res.status(200).json({
            success: true,
            message: "Login successful"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


app.get('/me', async (req,res)=>{
    const token = req.cookies.token;    
    if (!token) return res.status(401).json({
    success: false,
    message: "Unauthorized"
});

    try {
        const decoded = jwt.verify(token, "secret");

        res.json({
            id: decoded.id,
            email: decoded.email
        });
    } catch {
        return res.status(401).json({
                success: false,
                message:'server error'
            });
    }
})

app.post('/friend', async (req,res)=>{
    const {frd,_id} = req.body;
    if(!frd || !_id) 
    {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    try {
        const user = await users.findOne({_id:id})
        if(!user) return res.status(200).json({
                success: false,
                message: "user not found"
            });;
        const partner = await users.findOne({userName:frd})
        if(!partner) return res.status(401).json({ message: "No User found" });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
})

app.post('/analys', async (req, res) => {
    const { 
        basicStats, 
        user: id, 
        progressScore, 
        dailyTreads, 
        weeklyTreads, 
        improveTread,
    } = req.body;   

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "User ID missing"
        });
    }

    try {
        const user = await users.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
    const analysM = await analys.findOneAndUpdate(
        { userId : id }, 
        { basicStats, progressScore, dailyTreads, weeklyTreads, improveTread, userId: id, createdAt: new Date() },
        { upsert: true, returnDocument: 'after' }
    );

        if(!user.analys) user.analys = [];
        await users.findByIdAndUpdate(id, {
            $addToSet: { analys: analysM._id }
        });
        res.status(200).json({
            success: true,
            message: "Analytics updated successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
app.listen(4000)