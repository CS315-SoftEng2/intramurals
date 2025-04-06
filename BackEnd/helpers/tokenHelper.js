import jwt from "jsonwebtoken";

const generateToken = async (useraccount) => {
    const { user_name, user_type } = useraccount;

    if (!user_name || !user_type) {
        throw new Error('Invalid user data: user_name and user_type are required');
    }

    console.log("Payload result: ", useraccount);  

    const accessToken = jwt.sign(
        {
            user_name,  
            user_type, 
        },
        process.env.ACCESS_TOKEN_SECRET,  
        { expiresIn: "1h" }  
    );

    return accessToken; 
};

export default generateToken;
