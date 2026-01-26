import { Product } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.name} masuk keranjang`, {
      duration: 1500,
      position: 'top-center', // Mobile friendly
    });
  };

  const getCategoryIcon = (category: string) => {
    const lower = category?.toLowerCase() || '';
    if (lower === 'makanan') return '/icons/makanan.svg';
    if (lower === 'minuman') return '/icons/minuman.svg';
    if (lower === 'tambahan') return '/icons/tambahan.svg';
    return '/icons/default.svg';
  };

  const imageSrc = product.image || getCategoryIcon(product.category);

  return (
    <Card className="flex flex-col justify-between h-full active:scale-95 transition-transform duration-100 touch-manipulation overflow-hidden">
      <div className="relative w-full h-32 bg-white flex items-center justify-center p-2">
        <Image
          src={imageSrc}
          alt={product.name}
          width={96}
          height={96}
          className="object-contain w-full h-full"
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold line-clamp-2 leading-tight min-h-[2.5rem]">
          {product.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{product.category}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-lg font-bold text-primary">
          {formatRupiah(product.price)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          className="w-full h-10 text-sm font-semibold" 
          onClick={handleAdd}
          disabled={!product.isAvailable}
        >
          {product.isAvailable ? "Tambah" : "Habis"}
        </Button>
      </CardFooter>
    </Card>
  );
}
