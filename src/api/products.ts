import { executeGraphql } from "./client";
import {
	type InputMaybe,
	ProductsGetListDocument,
	type ProductWhereInput,
	ProductGetByIdDocument,
	ProductsGetBySearchDocument,
	ProductsGetByCollectionListDocument,
} from "@/gql/graphql";

type GetProductsListOptions = {
	pageNo: number;
	pageSize?: number;
	where?: InputMaybe<ProductWhereInput>;
};

export async function getProductById(id: string) {
	const { product } = await executeGraphql({ query: ProductGetByIdDocument, variables: { id } });
	return product;
}

export async function searchProducts(query: string) {
	const { products } = await executeGraphql({
		query: ProductsGetBySearchDocument,
		variables: { name_contains: query },
	});
	return products;
}

export async function getProductsListByCollection(collection: string) {
	const { products } = await executeGraphql({
		query: ProductsGetByCollectionListDocument,
		variables: {
			slug: collection,
		},
	});
	return products;
}

export async function getProductsList({
	pageSize = 4,
	pageNo,
	where = {},
}: GetProductsListOptions) {
	const offset = (pageNo - 1) * pageSize;

	const {
		products,
		productsConnection: {
			aggregate: { count },
		},
	} = await executeGraphql({
		query: ProductsGetListDocument,
		variables: {
			first: pageSize,
			skip: offset,
			where,
		},
	});

	return {
		products,
		numberOfPages: Math.ceil(count / pageSize),
	};
}
