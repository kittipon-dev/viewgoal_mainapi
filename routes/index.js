const mongoose = require('mongoose')

const Advertising = require('../models/advertising')
const Config = require('../models/config')
const Login = require('../models/login')
const User = require('../models/user')
const Camera = require('../models/camera')
const Comment = require('../models/comment')
const Refmes = require('../models/refmes')
const Messenger = require('../models/messenger')
const Notification = require('../models/notification')


const https = require('https');
const dayjs = require('dayjs')

const bcrypt = require('bcrypt')
const path = require('path');
const fs = require('fs')

const axios = require('axios');

mongoose.connect('mongodb://localhost:27017/viewgoal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const express = require('express');
const router = express.Router();
const multer = require('multer')
const { findOne } = require('../models/advertising')



router.get('/', async function (req, res, next) {
    const dbAdvertising = await Advertising.find({})
    res.render('index', { data: dbAdvertising });
});
router.get('/testnotifi', async function (req, res, next) {
    res.render('testnotifi');
});
router.get('/sendtestnotifi', async function (req, res, next) {
    const now = dayjs()
    const dbNotification = await Notification.findOneAndUpdate(
        {
            type: "system",
            t_user_id: 0,
            r_user_id: req.query.user_id,
            refid: now
        },
        {
            $set: {
                type: "system",
                t_user_id: 0,
                r_user_id: req.query.user_id,
                refid: now,
                txt: req.query.mes,
                time: now
            }
        },
        {
            upsert: true, new: true
        }
    )
    res.render('testnotifi');
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/advertising/')
    },
    filename: function (req, file, cb) {
        cb(null, req.body.ref + '.png')
    }
})
var upload = multer({ storage: storage })

router.post('/newA', upload.single('avatar'), async function (req, res, next) {
    console.log(req.body);
    const dbA = new Advertising({
        date: new Date(),
        ref: req.body.ref,
        topic: req.body.topic,
        urlimg: '/advertising/' + req.body.ref + '.png',
        txt: req.body.txt,
        use_point: req.body.use_point
    })
    await dbA.save()
    res.redirect('/')
})

router.get('/del_advertisin', async function (req, res, next) {
    const dbAdvertising = await Advertising.findOneAndDelete({ ref: req.query.ref })
    res.redirect('/')
});

router.post('/notifi', async (req, res) => {
    const now = dayjs()
    const dbNotification = await Notification.findOneAndUpdate(
        {
            type: "system",
            t_user_id: 0,
            r_user_id: req.body.r_user_id,
            refid: req.body.refid
        },
        {
            $set: {
                type: "system",
                t_user_id: 0,
                r_user_id: req.body.r_user_id,
                refid: req.body.refid,
                txt: req.body.txt,
                time: now
            }
        },
        {
            upsert: true, new: true
        }
    )
    res.end()
});

router.post('/login', async (req, res) => {
    const dbLoin = await Login.findOne({ username: req.body.username })
    if (dbLoin) {
        await bcrypt.compare(req.body.username + req.body.password, dbLoin.password, function (err, result) {
            if (result == true) {
                res.send({ login: 1, user_id: dbLoin.user_id })
            } else {
                res.sendStatus(401)
            }
        })
    } else {
        res.sendStatus(401)
    }
});

router.post('/register', async (req, res) => {
    const dbConfig = await Config.find({})
    const myobj = req.body
    myobj.user_id = dbConfig[0].user_id + 1
    await bcrypt.hash(myobj.username + myobj.password, 12).then(async (hash_pass) => {
        myobj.password = hash_pass
        const dbLoin = new Login(myobj)
        const dbUser = new User({
            user_id: myobj.user_id,
            name: req.body.name,
            birthday: req.body.birthday,
            following: [],
            followers: [],
            like: [],
            point: 0,
            activity: []
        })
        try {
            await dbUser.save()
            await dbLoin.save()
            await Config.updateOne(
                { user_id: myobj.user_id - 1 },
                { user_id: myobj.user_id })
            fs.copyFileSync('./public/images-profile/null.png', './public/images-profile/' + myobj.user_id + '.png')
        } catch (error) {
            res.sendStatus(400)
        }
    }).catch(err => {
        res.sendStatus(400)
    })
    res.end()
});

router.post('/addcamera', async (req, res) => {
    const myobj = {
        user_id: req.body.user_id,
        title: req.body.title,
        url: req.body.url,
        location: {
            name: req.body.l_name,
            lat: req.body.l_lat,
            long: req.body.l_long
        },
        timeon: {
            s: req.body.t_s,
            start: req.body.t_start,
            stop: req.body.t_stop
        },
        view: 0,
        like: 0
    }
    const dbCamera = new Camera(myobj)
    await dbCamera.save()
    res.end()
});

router.get('/startcam', async (req, res) => {
    const dbCamera = await Camera.findByIdAndUpdate(req.query._id, { status: true })
    var data = JSON.stringify({
        "idcamre": dbCamera._id,
        "rtsp": dbCamera.url
    });
    var config = {
        method: 'post',
        url: 'http://52.221.100.148:4000/add',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });
    res.end()
});
router.get('/stopcam', async (req, res) => {
    const dbCamera = await Camera.findByIdAndUpdate(req.query._id, { status: false })
    var config = {
        method: 'get',
        url: `http://52.221.100.148:4000/stop?idcamre=${dbCamera._id}`,
        headers: { }
      };
      
      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
    res.end()
});
router.get('/removedcam', async (req, res) => {
    const dbCamera = await Camera.findByIdAndRemove(req.query._id)
    res.end()
});



router.get('/me', async (req, res) => {
    const dbUser = await User.findOne({ user_id: req.query.user_id })
    const dbCamera = await Camera.find({ user_id: req.query.user_id })
    const myobj = {
        user: dbUser,
        camera: dbCamera
    }
    if (dbUser != null) {
        res.send(myobj)
    } else {
        res.sendStatus(401)
    }

});


router.post('/editprofile', async (req, res) => {
    console.log(req.body);
    const dbUser = await User.findOneAndUpdate({
        user_id: req.body.user_id
    }, {
        $set: {
            name: req.body.name,
            note: req.body.note
        }
    })
    res.end()
});


const storageI = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images-profile/')
    },
    filename: function (req, file, cb) {
        cb(null, req.body.user_id + '.png')
    }
})
const uploadI = multer({ storage: storageI })
router.post('/editprofile-upimg', uploadI.single('myFile'), async (req, res, next) => {
    console.log("upimg");
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next("hey error")
    }
    res.end()
})


router.get('/user', async (req, res) => {
    const dbUser = await User.findOne({ user_id: req.query.user_id })
    const dbCamera = await Camera.find({ user_id: req.query.user_id, status: true })
    const myobj = {
        user: dbUser,
        camera: dbCamera
    }
    res.send(myobj)
});

router.get('/addfavorite', async (req, res) => {
    const dbUser = await User.findOneAndUpdate(
        { user_id: req.query.user_id },
        { $push: { favorite: req.query.idcam } },
        { new: true })
    res.end()
});
router.get('/removefavorite', async (req, res) => {
    const dbUser = await User.findOneAndUpdate(
        { user_id: req.query.user_id },
        { $pull: { favorite: req.query.idcam } })
    res.end()
});

router.get('/listplaying', async (req, res) => {
    const dbCamera = await Camera.find({ status: true })
    const dbUser = await User.findOne({ user_id: req.query.user_id })
    let camf = []
    let i = 0
    try {
        dbUser.favorite.forEach(element => {
            dbCamera.forEach(e => {
                if (e._id == element) {
                    camf[i] = e
                    i++
                }
            });
        });
    } catch (error) {

    }
    const myobj = {
        listplay: dbCamera,
        favorite: camf,
        user: dbUser
    }
    res.send(myobj)
});
router.get('/getplay', async (req, res) => {
    const dbCamera = await Camera.findById(req.query._id)
    let v = false
    //  try {
    const dbUser = await User.findOne({ user_id: req.query.user_id })
    dbUser.view.forEach(element => {
        if (element == req.query._id) {
            v = true
        }
    });
    if (v == false) {
        const dbUser = await User.findOneAndUpdate(
            { user_id: req.query.user_id },
            { $push: { view: req.query._id } },
            { new: true })
        const dbCameraSave = await Camera.findByIdAndUpdate(
            req.query._id,
            { $set: { view: dbCamera.view + 1 } }
        )
    }
    /*
  } catch (error) {
  
  }
  */
    res.send(dbCamera)
});

router.get('/like', async (req, res) => {
    const now = dayjs()
    const dbUser = await User.findOne({ user_id: req.query.t_user_id })
    let l = false
    try {
        dbUser.like.forEach(element => {
            if (element == req.query.idcam) {
                l = false
            }
        });
        if (l == false) {
            const dbUser = await User.findOneAndUpdate(
                { user_id: req.query.t_user_id },
                { $push: { like: req.query.idcam } },
                { new: true })
            const dbCamera = await Camera.findById(req.query.idcam)
            const dbCameraSave = await Camera.findByIdAndUpdate(
                req.query.idcam,
                { $set: { like: dbCamera.like + 1 } }
            )
        }
        const dbNotification = await Notification.findOneAndUpdate(
            {
                type: "like",
                t_user_id: req.query.t_user_id,
                r_user_id: req.query.r_user_id,
                refid: req.query.idcam
            },
            {
                $set: {
                    type: "like",
                    t_user_id: req.query.t_user_id,
                    r_user_id: req.query.r_user_id,
                    refid: req.query.idcam,
                    time: now
                }
            },
            {
                upsert: true, new: true
            }
        )

    } catch (error) {

    }
    res.end()
});
router.get('/unlike', async (req, res) => {
    console.log(req.query);
    const dbUser = await User.findOne({ user_id: req.query.t_user_id })
    let l = false
    try {
        const dbUser = await User.findOneAndUpdate(
            { user_id: req.query.t_user_id },
            { $pull: { like: req.query.idcam } })
        const dbCamera = await Camera.findById(req.query.idcam)
        const dbCameraSave = await Camera.findByIdAndUpdate(
            req.query.idcam,
            { $set: { like: dbCamera.like - 1 } }
        )

    } catch (error) {

    }
    res.end()
});





router.get('/getall_gift', async (req, res) => {
    const dbAdvertising = await Advertising.find({})
    res.send(dbAdvertising)
});




//----------   Top UP

router.get('/top_up', async (req, res) => {
    const dbUser = await User.findOne({ user_id: req.query.user_id })
    const newPoint = parseInt(dbUser.point) + parseInt(req.query.price)
    await User.findOneAndUpdate({ user_id: req.query.user_id }, { $set: { point: newPoint } })
    res.end()
});

router.get('/get_point', async (req, res) => {
    const dbUser = await User.findOne({ user_id: req.query.user_id })
    res.send(dbUser)
});

router.get('/use_point', async (req, res) => {
    console.log(req.query);
    const dbAdvertising = await Advertising.findOne({ ref: req.query.ref })
    const dbUser = await User.findOneAndUpdate(
        { user_id: req.query.user_id },
        { $push: { activity: dbAdvertising } }
    )
    res.end()
});



//-------------------  Comment

router.post('/postcomment', async (req, res) => {
    console.log(req.query);
    const now = dayjs()
    const myobj = {
        idcam: req.query.idcam,
        user_id: req.query.user_id,
        comment: req.query.commentTxt,
    }
    const dbComment = new Comment(myobj)
    dbComment.save()
    const dbCamera = await Camera.findById(req.query.idcam)
    const dbNotification = await Notification.findOneAndUpdate(
        {
            type: "comment",
            t_user_id: myobj.user_id,
            r_user_id: dbCamera.user_id,
            refid: myobj.idcam
        },
        {
            $set: {
                type: "comment",
                t_user_id: myobj.user_id,
                r_user_id: dbCamera.user_id,
                refid: myobj.idcam,
                txt: myobj.comment,
                time: now
            }
        },
        {
            upsert: true, new: true
        }
    )
    res.end()
});

router.get('/get_comment', async (req, res) => {
    const dbComment = await Comment.find({ idcam: req.query.idcam })
    res.send(dbComment.reverse())
    res.end()
});



router.get('/add_follow', async (req, res) => {
    const now = dayjs()
    const dbUser = await User.findOneAndUpdate(
        { user_id: req.query.user_id },
        { $push: { following: req.query.userID } }
    )
    const dbUser2 = await User.findOneAndUpdate(
        { user_id: req.query.userID },
        { $push: { followers: req.query.user_id } }
    )
    const dbNotification = await Notification.findOneAndUpdate(
        {
            type: "follow",
            t_user_id: req.query.user_id,
            r_user_id: req.query.userID,
        },
        {
            $set: {
                type: "follow",
                t_user_id: req.query.user_id,
                r_user_id: req.query.userID,
                time: now
            }
        },
        {
            upsert: true, new: true
        }
    )
    res.end()
});


router.get('/un_follow', async (req, res) => {
    console.log("unU");
    const dbUser = await User.findOne({ user_id: req.query.user_id, })
    let newArr = []
    for (let index = 0; index < dbUser.following.length; index++) {
        const element = dbUser.following[index];
        if (element != req.query.userID) {
            newArr[index] = element
        }
    }
    const dbUserNew = await User.findOneAndUpdate(
        { user_id: req.query.user_id },
        { $set: { following: newArr } }
    )

    const dbUser2 = await User.findOne({ user_id: req.query.userID, })
    let newArr2 = []
    for (let index = 0; index < dbUser2.followers.length; index++) {
        const element = dbUser2.followers[index];
        if (element != req.query.user_id) {
            newArr2[index] = element
        }
    }
    const dbUserNew2 = await User.findOneAndUpdate(
        { user_id: req.query.userID },
        { $set: { followers: newArr2 } }
    )
    res.end()
});

router.get('/add_like', async (req, res) => {
    console.log("add");
    const dbUser = await User.findOneAndUpdate(
        { user_id: req.query.user_id },
        { $push: { like: req.query.userID } }
    )
    const dbUser2 = await User.findOneAndUpdate(
        { user_id: req.query.userID },
        { $push: { likeme: req.query.user_id } }
    )
    res.end()
});

router.get('/un_like', async (req, res) => {

    const dbUser = await User.findOne({ user_id: req.query.user_id, })
    let newArr = []
    for (let index = 0; index < dbUser.likeme.length; index++) {
        const element = dbUser.likeme[index];
        if (element != req.query.userID) {
            newArr[index] = element
        }
    }
    const dbUserNew = await User.findOneAndUpdate(
        { user_id: req.query.user_id },
        { $set: { like: newArr } }
    )

    const dbUser2 = await User.findOne({ user_id: req.query.userID, })
    let newArr2 = []
    for (let index = 0; index < dbUser2.likeme.length; index++) {
        const element = dbUser2.likeme[index];
        if (element != req.query.user_id) {
            newArr2[index] = element
        }
    }
    const dbUserNew2 = await User.findOneAndUpdate(
        { user_id: req.query.userID },
        { $set: { likeme: newArr2 } }
    )

    res.end()
});

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

//-------------------  Mess
router.post('/sendmes', async (req, res) => {
    const now = dayjs()
    const dbRefmes = await Refmes.findOne({ user_id_1: req.body.t_user_id, user_id_2: req.body.r_user_id });
    if (dbRefmes) {
        const dbMessenger = await Messenger.findOneAndUpdate({
            reference: dbRefmes.reference
        }, {
            $push: {
                data: {
                    t_user_id: req.body.t_user_id,
                    r_user_id: req.body.r_user_id,
                    mes: req.body.mes,
                    time: now
                }
            }
        }, { upsert: true, new: true })
    } else {
        const ref = makeid(10)
        const dbRefmesNew1 = new Refmes({
            user_id_1: req.body.t_user_id,
            user_id_2: req.body.r_user_id,
            reference: ref
        })
        await dbRefmesNew1.save()
        const dbRefmesNew2 = new Refmes({
            user_id_1: req.body.r_user_id,
            user_id_2: req.body.t_user_id,
            reference: ref
        })
        await dbRefmesNew2.save()
        const dbMessenger = await Messenger.findOneAndUpdate({
            reference: ref
        }, {
            $set: {
                data: {
                    t_user_id: req.body.t_user_id,
                    r_user_id: req.body.r_user_id,
                    mes: req.body.mes,
                    time: now
                }
            }
        }, { upsert: true, new: true })
    }
    io.emit(req.body.r_user_id, {
        t_user_id: req.body.t_user_id,
        r_user_id: req.body.r_user_id,
        mes: req.body.mes
    })
    res.end()
});

router.get('/get_mesAll', async (req, res) => {
    const dbMessenger = await Refmes.find({
        user_id_1: req.query.user_id
    })
    res.send(dbMessenger)
    res.end()
});

router.get('/get_mes', async (req, res) => {
    const dbRefmes = await Refmes.findOne({
        user_id_1: req.query.t_user_id,
        user_id_2: req.query.r_user_id
    })
    if (dbRefmes) {
        const dbMessenger = await Messenger.findOne({
            reference: dbRefmes.reference
        })
        if (dbMessenger) {
            res.send(dbMessenger)
            res.end()
        } else {
            res.sendStatus(204)
        }
    } else {
        res.sendStatus(204)
    }
});



//--------------------map
router.get('/getmap', async (req, res) => {
    const dbCamera = await Camera.find({ status: true })
    if (dbCamera) {
        res.send(dbCamera)
        res.end()
    } else {
        res.sendStatus(204)
    }
});

router.get('/get_notifi', async (req, res) => {
    const dbNotification = await Notification.find(
        {
            r_user_id: req.query.user_id
        }
    )
    res.send(dbNotification.reverse())
});




router.post('/getname', async (req, res) => {
    const user_id = req.body
    const reName = []
    try {
        for (let index = 0; index < user_id.length; index++) {
            const element = user_id[index];
            if (element != 0) {
                const dbUser = await User.findOne({ user_id: element })
                reName[index] = dbUser.name
            } else {
                reName[index] = "System"
            }

        }
        res.send(reName)
    } catch (error) {

    }
});

router.post('/getnamecam', async (req, res) => {
    const idcam = req.body
    const reName = []
    try {
        for (let index = 0; index < idcam.length; index++) {
            const element = idcam[index];
            const dbCamera = await Camera.findById(element)
            reName[index] = dbCamera.title
        }
        res.send(reName)
    } catch (error) {

    }
});

module.exports = router;



var http = require('http').createServer();
var io = require('socket.io')(http);

io.on('connection', function (socket) {

});

/*
setInterval(() => {
    io.emit('2','test')
}, 5000);
*/
http.listen(3000, function () {
    console.log('listening on *:3000');
});

