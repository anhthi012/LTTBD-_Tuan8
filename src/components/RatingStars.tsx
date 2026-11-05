import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  value: number; // 0–5 (có thể lẻ, làm tròn khi vẽ)
  size?: number;
  onChange?: (v: number) => void; // có truyền → cho phép bấm chọn sao
}

export function RatingStars({ value, size = 18, onChange }: Props) {
  // Làm tròn giá trị để xác định số sao được tô màu[cite: 1]
  const filled = Math.round(value);

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => {
        // Vẽ từng ngôi sao, n <= filled thì tô màu vàng (warning), ngược lại màu xám (line)[cite: 1]
        const star = (
          <Text
            key={n}
            style={{ fontSize: size, color: n <= filled ? colors.warning : colors.line }}
          >
            ★
          </Text>
        );

        // Nếu có hàm onChange, bọc sao trong Pressable để có thể bấm[cite: 1]
        return onChange ? (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            hitSlop={4}
            accessibilityLabel={`${n} sao`}
          >
            {star}
          </Pressable>
        ) : (
          star
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2 // Tạo khoảng cách nhỏ giữa các ngôi sao
  },
});