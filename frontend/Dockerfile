# Sử dụng Node 20 Alpine nhẹ và tối ưu
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json để cache layer cài đặt thư viện
COPY package*.json ./

# Cài đặt các gói phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn frontend
COPY . .

# Mở cổng 5173 cho Vite Dev Server
EXPOSE 5173

# Khởi chạy Vite dev server lắng nghe trên tất cả các network interface (0.0.0.0)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
