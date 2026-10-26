import axios from "axios";

async function createRazorpayOrder(orderId, token){
    const res = await axios.post('/create-order',{ orderId },{
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

