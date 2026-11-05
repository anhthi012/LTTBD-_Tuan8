import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CartItem } from "../types";
import { colors, formatPrice, radius } from "../theme";
import { useDebounce } from "../hooks/useDebounce"; // Import hook useDebounce có sẵn trong thư mục hooks

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

export function CartItemRow({ item, onChangeQty, onRemove }: Props) {
  // 1) Khai báo state cục bộ và debounce[cite: 1]
  const [qty, setQty] = useState(item.quantity);
  const debouncedQty = useDebounce(qty, 300);

  // 2) Lắng nghe thay đổi của debouncedQty để gọi hàm cập nhật lên store[cite: 1]
  useEffect(() => {
    if (debouncedQty !== item.quantity) {
      onChangeQty(item.bookId, debouncedQty);
    }
  }, [debouncedQty, item.quantity, item.bookId, onChangeQty]);

  // 3) Đồng bộ state nếu số lượng bị đổi từ nơi khác (VD: thêm từ màn chi tiết)[cite: 1]
  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  // 4) Xác định giới hạn của nút bấm[cite: 1]
  const canDec = qty > 1;
  const canInc = qty < item.stock;

  return (
    <View style={styles.row}>
      <View style={[styles.cover, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>

        {/* Cụm nút Tăng/Giảm số lượng */}
        <View style={styles.controls}>
          <Pressable
            style={[styles.btn, !canDec && styles.btnDisabled]}
            disabled={!canDec}
            onPress={() => setQty((q) => q - 1)}
            accessibilityLabel="Giảm"
            hitSlop={6}
          >
            <Text style={styles.btnText}>−</Text>
          </Pressable>

          <Text style={styles.qty}>{qty}</Text>

          <Pressable
            style={[styles.btn, !canInc && styles.btnDisabled]}
            disabled={!canInc}
            onPress={() => setQty((q) => q + 1)}
            accessibilityLabel="Tăng"
            hitSlop={6}
          >
            <Text style={styles.btnText}>+</Text>
          </Pressable>

          {/* 5) Hiển thị tồn kho[cite: 1] */}
          <Text style={styles.stock}>Còn {item.stock}</Text>
        </View>
      </View>

      <Pressable onPress={() => onRemove(item.bookId)} hitSlop={8} accessibilityLabel="Xóa khỏi giỏ">
        <Text style={styles.trash}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, padding: 10, marginHorizontal: 12, marginVertical: 5, gap: 10 },
  cover: { width: 54, height: 72, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: "700", color: colors.text },
  price: { color: colors.indigo, fontWeight: "800" },
  controls: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  btn: { backgroundColor: "#E2E8F0", width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 16, fontWeight: "700", color: colors.navy, marginTop: -2 },
  qty: { fontWeight: "800", color: colors.navy, fontSize: 16, minWidth: 20, textAlign: "center" },
  stock: { fontSize: 12, color: colors.text, opacity: 0.6, marginLeft: 4 },
  trash: { fontSize: 22 },
});