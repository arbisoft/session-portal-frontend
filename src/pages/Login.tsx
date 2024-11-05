import React, { FC } from "react";
import { GoogleLoginButton } from "../molecules/GoogleLoginButton";



export const Login: FC = () => <div style={{ top: "50%", right: "40%", position: "fixed" }}>
    <GoogleLoginButton />
</div>;
