import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Load your publishable key
const stripePromise = loadStripe("pk_test_51RIoZHI3EnCK6Xc866CWkgWXZH5gETXqCE5owHrkKSpYDkA2MioDooFS0QlnRkrDZRmatZTwJJr53EqAbEPynW5W004wKncvj7");

export default function StripeProvider({ children }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
