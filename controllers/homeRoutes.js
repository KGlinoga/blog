const router = require('express').Router();
const { Blog, User } = require('../models');
const withAuth = require('../utils/auth');

// URL: 3001/ 
router.get('/', async (req,res) => {
    try {
        // get ALL blogs and JOIN w/ user data
        const blogData = await Blog.findAll({
            include: [
                {
                    model: User,
                    attributes: ['name'],
                },
            ],
        });

        // Serializing data so template can read it
        const blogs = blogData.map((blog) => blog.get({ plain: true }));

        console.log("Blog Data: "+JSON.stringify(blogs));

        // pass serialized data and session flag into template
        res.render('homepage', {
            blogs,
            logged_in: req.session.logged_in 
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// URL: 3001/project/ID NUMBER
router.get('/project/:id', async (req,res) => {
    try {
        const blogData = await Blog.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['name'],
                },
            ],
        });

        const blog = blogData.get({plain: true});

        res.render('blog', {
            ...blog,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Use withAuth middleware to prevent accest to route
// URL: 3001/profile
router.get('/profile', withAuth, async (req,res) => {
    try {
// find logged in user based on session ID
        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Blog }],
        });

        const user = userData.get({ plain: true });

        res.render('profile', {
            ...user,
            logged_in:true
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

//  URL 3001/login
router.get('/login', (req,res)=> {
    // checking if user is already logged in, redirects req to another route
    if (req.session.logged_in) {
        res.redirect('/profile');
        return;
    }

    res.render('login');
});

module.exports = router;
