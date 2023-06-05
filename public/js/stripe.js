import axios from "axios";
import { showAlert } from "./alerts";
const stripe = Stripe(
	"pk_test_51NFKjXB5IkiwL2IGkJ0fn7IKp4r9128mXtv9aytuVkyZoPiw0kwtvz6U4K4Ah6ISLxHyQhqoYwqEPn6OiSTPGyzH00o3utiCWO"
);

export const bookTour = async (tourId) => {
	try {
		// 1) Get the checkout session frop API
		const session = await axios(
			`http://127.0.0.1:5000/api/v1/bookings/checkout-session/${tourId}`
		);

		// 2) Create checkout form + change credit card
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id,
		});
	} catch (err) {
		console.log(err);
		showAlert("error", err);
	}
};
