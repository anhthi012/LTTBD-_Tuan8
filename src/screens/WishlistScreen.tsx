import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BookGrid } from "../components/BookGrid";
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { getBooks } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useWishlist } from "../store/hooks";
import { RootScreenProps } from "../navigation/types";
import { Book } from "../types"; // Nhập thêm type Book
import { colors } from "../theme";

export function WishlistScreen({ navigation }: RootScreenProps<"Wishlist">) {
  // 1) Lấy danh sách id đã thả tim từ store và khởi tạo state dữ liệu[cite: 1]
  const { ids } = useWishlist();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm load dữ liệu bọc trong useCallback[cite: 1]
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBooks(await getBooks());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 2) Lọc ra những cuốn sách nằm trong danh sách yêu thích[cite: 1]
  const favorites = useMemo(
    () => books.filter((b) => ids.includes(b.id)),
    [books, ids]
  );

  // 3) Xử lý giao diện lúc đang tải hoặc bị lỗi[cite: 1]
  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  // 4) Hiển thị lưới sách yêu thích, hoặc trạng thái trống[cite: 1]
  return (
    <View style={styles.container}>
      <BookGrid
        data={favorites}
        onPressBook={(b) => navigation.navigate("BookDetail", { bookId: b.id })}
        ListEmptyComponent={
          <EmptyState
            emoji="💔"
            title="Chưa có sách yêu thích"
            message="Nhấn ♡ trên mỗi cuốn sách để lưu lại ở đây."
            actionLabel="Khám phá sách"
            onAction={() => navigation.navigate("Tabs", { screen: "Home" })}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 }
});