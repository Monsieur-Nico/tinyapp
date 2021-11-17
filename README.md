# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
This is an educational project built during my experience at [Lighthouse Labs](https://www.lighthouselabs.ca/).

## Final Product

- Create a new account
!["Create a new Account"](https://i.imgur.com/AsztBWy.png)

- Make new shortened URLs
!["Make new shortened URLs"](https://i.imgur.com/5DO61EB.png)

- URLs list
!["List URLs"](https://i.imgur.com/lL5tzdF.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.

## Further Information

 - Available routes:
   - `/login/`: to login.
   - `/register/`: to register.
   - `/urls/`:      to get to the list of URLs available for you.
   - `/u/shortURL/`: to use the short URL (If you're logged in).
   - `/urls/new/`: to make a new short URL (If you're logged in).