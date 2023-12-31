import { cookies } from "next/headers";
import { executeGraphql } from "./client";
import {
	CartAddItemDocument,
	CartChangeItemQuantityDocument,
	CartCreateDocument,
	CartGetByIdDocument,
	CartRemoveItemDocument,
	ProductGetByIdDocument,
} from "@/gql/graphql";

export async function getCart() {
	const cartId = cookies().get("cartId")?.value;
	if (cartId) {
		const { order: cart } = await executeGraphql({
			query: CartGetByIdDocument,
			variables: {
				id: cartId,
			},
			next: {
				tags: ["cart"],
			},
		});
		if (cart) {
			return cart;
		}
	}

	return null;
}

export async function getOrCreateCart() {
	const cart = await getCart();

	if (cart) {
		return cart;
	}

	const { createOrder: newCart } = await executeGraphql({
		query: CartCreateDocument,
		next: {
			tags: ["cart"],
		},
	});
	if (!newCart) {
		throw new Error("Failed to create cart");
	}

	cookies().set("cartId", newCart.id);
	return newCart;
}

export async function addProductToCart(cartId: string, productId: string) {
	const { product } = await executeGraphql({
		query: ProductGetByIdDocument,
		variables: {
			id: productId,
		},
		next: {
			tags: ["cart"],
		},
	});
	if (!product) {
		throw new Error(`Product with id ${productId} not found`);
	}

	await executeGraphql({
		query: CartAddItemDocument,
		variables: {
			cartId,
			productId,
			total: product.price,
		},
		next: {
			tags: ["cart"],
		},
	});
}

export async function changeItemQuantity(itemId: string, quantity: number) {
	await executeGraphql({
		query: CartChangeItemQuantityDocument,
		variables: {
			itemId,
			quantity,
		},
		next: {
			tags: ["cart"],
		},
	});
}

export async function removeItem(itemId: string) {
	await executeGraphql({
		query: CartRemoveItemDocument,
		variables: { itemId },
		next: {
			tags: ["cart"],
		},
	});
}
