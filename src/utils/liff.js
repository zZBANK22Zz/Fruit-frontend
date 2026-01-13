import liff from "@line/liff";

const initLiff = async () => {
    try {
        await liff.init({
            liffId: process.env.NEXT_PUBLIC_LIFF_ID,
        })
    } catch (error) {
        console.error("LIFF initialization failed", error);
    }
}

export default initLiff;