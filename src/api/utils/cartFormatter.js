exports.formatCartItem = (item) => {
    const product = item.product || item;
    const sku = item.sku;
  
    const attributes =
      sku?.attributes?.map((attr) => {
        const matchedValue = attr.attributeId?.values?.find(
          (val) => val._id.toString() === attr.valueId.toString()
        );
        return matchedValue?.value || ""; 
      }) || [];
  
    return {
      productName: product.name || "Unnamed Product",
      productImage: product.images?.[0] || "",
      attributes,
      discountPrice: sku?.discountPrice || 0,
      qty: item.quantity || 1,
    };
  };
  