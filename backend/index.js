const express = require('express')
const app = express()
const users = require('./models/user.Model')
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookies = require('cookie-parser')

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

            const hashpass= bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(password,salt, async (err,hash)=>{
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
                })
            })
            
            
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

        // ✅ DO NOT store password
        const token = jwt.sign(
            { id: findUser._id, email: findUser.email },
            "secret",
            { expiresIn: "1h" }
        );

        // ✅ Secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: "lax"
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

function auth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    try {
        const decoded = jwt.verify(token, "secret");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
}
app.get('/dashboard', auth, (req, res) => {
    res.json({
        message: "Welcome",
        user: req.user
    });
});
app.listen(4000)