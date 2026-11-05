import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { hydrateCart } from "../store/cartSlice";
import { hydrateWishlist } from "../store/wishlistSlice";
import { clearAuth, loadAuth, saveAuth } from "../storage/authStorage";
import { loadJSON } from "../storage/storage";
import { useAutoPersist } from "./useAutoPersist";
import { CartItem } from "../types";

export const CART_KEY = "@bookstore/cart";
export const WISHLIST_KEY = "@bookstore/wishlist";

export function usePersistence() {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const cartItems = useAppSelector((s) => s.cart.items);
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);

  // 1) Khởi tạo: đọc dữ liệu từ máy khi mở app[cite: 1]
  useEffect(() => {
    (async () => {
      // Dùng Promise.all để đọc đồng thời 3 luồng dữ liệu[cite: 1]
      const [auth, cart, wish] = await Promise.all([
        loadAuth(),
        loadJSON<CartItem[]>(CART_KEY),
        loadJSON<number[]>(WISHLIST_KEY)
      ]);

      // BT8.3: Nạp lại phiên đăng nhập[cite: 1]
      if (auth?.token && auth.user) dispatch(setCredentials(auth));

      // BT8.7b: Nạp lại giỏ hàng và danh sách yêu thích[cite: 1]
      if (cart) dispatch(hydrateCart(cart));
      if (wish) dispatch(hydrateWishlist(wish));

      setReady(true); // Chỉ bật cờ ready sau khi đã đọc xong[cite: 1]
    })();
  }, [dispatch]);

  // 2) Ghi/Xóa phiên đăng nhập mỗi khi user hoặc token thay đổi
  useEffect(() => {
    if (!ready) return;
    if (user && token) {
      saveAuth({ user, token });
    } else {
      clearAuth();
    }
  }, [ready, user, token]);

  // 3) Ghi tự động giỏ hàng và danh sách yêu thích bằng custom hook[cite: 1]
  useAutoPersist(CART_KEY, cartItems, ready);
  useAutoPersist(WISHLIST_KEY, wishlistIds, ready);

  return ready;
}