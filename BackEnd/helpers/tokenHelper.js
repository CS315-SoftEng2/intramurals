import jwt from "jsonwebtoken";

const generateToken = async (useraccount) => {
    const { user_name, user_type } = useraccount;

    console.log("Payload result: ",useraccount);

    const accessToken = jwt.sign({
        user_name: user_name,
        user_type: user_type,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
);

return accessToken;
};

export default generateToken;

