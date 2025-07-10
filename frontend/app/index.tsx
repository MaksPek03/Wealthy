import { Redirect } from 'expo-router';
import React from 'react';

const index = () => {

    return (
        <Redirect href={"/welcome_pages/welcome"} />
    );
}

export default index;
