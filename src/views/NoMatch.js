import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NoMatch(){

    const navigate = useNavigate();

    useEffect(() => {
        alert('No page found!')
        navigate('/')
    },[navigate]);
    
};