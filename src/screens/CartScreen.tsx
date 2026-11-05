import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { Header } from "../components/Header";
import { CartItemRow } from "../components/CartItemRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";
import { useCart, useAuth } from "../store/hooks"; // Thêm useAuth
import { confirmDialog } from "../utils/dialog";
import { TabScreenProps } from "../navigation/types";
import { colors, formatPrice, radius } from "../theme";

export function CartScreen({ navigation }: TabScreenProps<"Cart">) {
  const { items, totalPrice, setQty, remove } = useCart();
  const { isLoggedIn } = useAuth(); // Lấy trạng thái đăng nhập[cite: 1]

  // BT8.C2: State cho mã giảm giá[cite: 1]
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  // BT8.C2: Cấu hình mã giảm giá và tính toán số tiền[cite: 1]
  const COUPONS: Record<string, { label: string; discount: (subtotal: number) => number }> = {
    SALE10: { label: "Giảm 10%", discount: (s) => Math.round(s * 0.1) },
    GIAM50K: { label: "Giảm 50.000đ", discount: (s) => Math.min(50000, s) },
  };
  const discount = coupon ? COUPONS[coupon].discount(totalPrice) : 0;
  const finalTotal = totalPrice - discount;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setCoupon(code);
      setCouponMsg(`Đã áp dụng ${code}: ${COUPONS[code].label}`);
    } else if (code === "") {
      setCoupon(null);
      setCouponMsg("");
    } else {
      setCoupon(null);
      setCouponMsg("Mã giảm giá không hợp lệ");
    }
  };

  // BT8.7a: Xóa sản phẩm có xác nhận[cite: 1]
  const askRemove = (bookId: number) => {
    const item = items.find((i) => i.bookId === bookId);
    confirmDialog(
      "Xóa sản phẩm",
      `Xóa "${item?.title ?? "sản phẩm"}" khỏi giỏ hàng?`,
      () => remove(bookId)
    );
  };

  // BT8.4: Bảo vệ Checkout[cite: 1]
  const goCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate("Checkout", { total: finalTotal });
    } else {
      navigation.navigate("Login", { redirectTo: "Checkout", total: finalTotal });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="🛒 Giỏ hàng" />
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.bookId)}
        renderItem={({ item }) => <CartItemRow item={item} onChangeQty={setQty} onRemove={askRemove} />}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            emoji="🛒"
            title="Giỏ hàng trống"
            message="Hãy chọn vài cuốn sách yêu thích nhé."
            actionLabel="Khám phá sách"
            onAction={() => navigation.navigate("Home")}
          />
        }
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          {/* BT8.C2: Ô nhập mã giảm giá[cite: 1] */}
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Mã giảm giá (SALE10)"
              value={couponInput}
              onChangeText={setCouponInput}
              autoCapitalize="characters"
            />
            <Pressable style={styles.applyBtn} onPress={applyCoupon}>
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </Pressable>
          </View>

          {couponMsg ? (
            <Text style={[styles.couponMsg, !coupon && styles.couponError]}>
              {couponMsg}
            </Text>
          ) : null}

          <View style={styles.line}>
            <Text style={styles.muted}>Tạm tính</Text>
            <Text style={styles.value}>{formatPrice(totalPrice)}</Text>
          </View>

          {coupon ? (
            <View style={styles.line}>
              <Text style={styles.muted}>Giảm giá</Text>
              <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
            </View>
          ) : null}

          <View style={styles.line}>
            <Text style={styles.total}>Tổng cộng</Text>
            <Text style={styles.total}>{formatPrice(finalTotal)}</Text>
          </View>

          <PrimaryButton title="Thanh toán" onPress={goCheckout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  footer: { backgroundColor: "#fff", padding: 14, gap: 8, borderTopWidth: 1, borderTopColor: colors.line },
  line: { flexDirection: "row", justifyContent: "space-between" },
  muted: { color: colors.muted },
  value: { fontWeight: "700", color: colors.text },
  discountValue: { fontWeight: "700", color: colors.success ?? "#10B981" },
  total: { fontSize: 17, fontWeight: "800", color: colors.navy },
  couponRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  couponInput: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 12, height: 44 },
  applyBtn: { backgroundColor: colors.indigo, paddingHorizontal: 16, borderRadius: radius.md, justifyContent: "center" },
  applyBtnText: { color: "#fff", fontWeight: "700" },
  couponMsg: { fontSize: 12, color: colors.success ?? "#10B981", marginBottom: 4 },
  couponError: { color: colors.danger },
});