import { Redirect } from 'expo-router';

export default function Index() {

    return (
        <Redirect href={"/welcome_pages/welcome"} />
    );
}
