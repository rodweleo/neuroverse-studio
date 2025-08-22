import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ContinueWithIcpAuthenticatorBtn from "./continue-with-icp-authenticator-btn";

export default function AuthForm() {
  return (
    <Card className="w-full max-w-md h-fit">
      <CardHeader>
        <CardTitle>Login or Create Neuro Account in seconds</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <ContinueWithIcpAuthenticatorBtn />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm">
          By continuing, you agree to Neuroverse&apos; Terms of Use.
        </p>
      </CardFooter>
    </Card>
  );
}
