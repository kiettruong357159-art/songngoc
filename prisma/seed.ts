import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('--- Bắt đầu khởi tạo dữ liệu mẫu Sông Ngọc Hotel ---');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Quản trị viên',
      permissions: JSON.stringify(['*']),
      description: 'Toàn quyền điều hành và quản trị hệ thống',
    },
  });

  const receptionistRole = await prisma.role.upsert({
    where: { code: 'RECEPTIONIST' },
    update: {},
    create: {
      code: 'RECEPTIONIST',
      name: 'Lễ tân',
      permissions: JSON.stringify([
        'rooms:view',
        'rooms:status',
        'bookings:*',
        'invoices:*',
        'services:*',
      ]),
      description: 'Nghiệp vụ quầy lễ tân, check-in, check-out, minibar',
    },
  });

  await prisma.role.upsert({
    where: { code: 'HOUSEKEEPING' },
    update: {},
    create: {
      code: 'HOUSEKEEPING',
      name: 'Buồng phòng',
      permissions: JSON.stringify(['rooms:view', 'rooms:clean']),
      description: 'Nghiệp vụ dọn dẹp và cập nhật trạng thái phòng',
    },
  });

  // 2. Users
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Quản Trị Viên',
      email: 'admin@songngoc.vn',
      phone: '0901234567',
      password: hashPassword('admin123'),
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'receptionist' },
    update: {},
    create: {
      username: 'receptionist',
      name: 'Lễ Tân Ca Ngày',
      email: 'letan@songngoc.vn',
      phone: '0907654321',
      password: hashPassword('rec123'),
      roleId: receptionistRole.id,
    },
  });

  // 3. Floors
  const floor1 = await prisma.floor.upsert({
    where: { floorNumber: 1 },
    update: {},
    create: { name: 'Tầng 1 (Trệt)', floorNumber: 1 },
  });

  const floor2 = await prisma.floor.upsert({
    where: { floorNumber: 2 },
    update: {},
    create: { name: 'Tầng 2', floorNumber: 2 },
  });

  const floor3 = await prisma.floor.upsert({
    where: { floorNumber: 3 },
    update: {},
    create: { name: 'Tầng 3', floorNumber: 3 },
  });

  // 4. Room Types
  const standardSingle = await prisma.roomType.upsert({
    where: { slug: 'standard-single' },
    update: {},
    create: {
      name: 'Phòng Đơn Tiêu Chuẩn',
      slug: 'standard-single',
      basePrice: 450000,
      weekendPrice: 520000,
      hourlyPrice: 150000,
      maxAdults: 1,
      maxChildren: 1,
      bedType: '1 Giường đơn cao cấp',
      roomArea: 22.0,
      amenities: JSON.stringify(['wifi', 'air_con', 'tv_smart', 'hot_water']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      ]),
      description:
        'Phòng đơn tiêu chuẩn ấm cúng, thiết kế hiện đại, đầy đủ tiện nghi cho khách công tác hoặc du lịch một mình.',
    },
  });

  const deluxeDouble = await prisma.roomType.upsert({
    where: { slug: 'deluxe-double' },
    update: {},
    create: {
      name: 'Phòng Đôi Deluxe View Sông',
      slug: 'deluxe-double',
      basePrice: 650000,
      weekendPrice: 750000,
      hourlyPrice: 200000,
      maxAdults: 2,
      maxChildren: 1,
      bedType: '1 Giường đôi King size',
      roomArea: 32.5,
      amenities: JSON.stringify([
        'wifi',
        'air_con',
        'tv_smart',
        'hot_water',
        'balcony',
        'river_view',
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      ]),
      description:
        'Phòng đôi Deluxe với ban công hướng thẳng dòng Sông Ngọc thơ mộng, không gian thoáng đãng và phong cách trang nhã.',
    },
  });

  const vipFamily = await prisma.roomType.upsert({
    where: { slug: 'vip-family' },
    update: {},
    create: {
      name: 'Phòng Gia Đình VIP Ban Công',
      slug: 'vip-family',
      basePrice: 1100000,
      weekendPrice: 1300000,
      hourlyPrice: 350000,
      maxAdults: 4,
      maxChildren: 2,
      bedType: '2 Giường đôi Queen',
      roomArea: 48.0,
      amenities: JSON.stringify([
        'wifi',
        'air_con',
        'tv_smart',
        'hot_water',
        'balcony',
        'bathtub',
        'kitchen',
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      ]),
      description:
        'Căn hộ gia đình VIP rộng rãi với bồn tắm nằm cao cấp, ban công toàn cảnh và khu vực tiếp khách tiện nghi.',
    },
  });

  // 5. Rooms
  const roomsData = [
    { roomNumber: '101', floorId: floor1.id, roomTypeId: standardSingle.id, status: 'AVAILABLE' },
    { roomNumber: '102', floorId: floor1.id, roomTypeId: deluxeDouble.id, status: 'AVAILABLE' },
    { roomNumber: '103', floorId: floor1.id, roomTypeId: deluxeDouble.id, status: 'DIRTY' },
    { roomNumber: '201', floorId: floor2.id, roomTypeId: standardSingle.id, status: 'AVAILABLE' },
    { roomNumber: '202', floorId: floor2.id, roomTypeId: deluxeDouble.id, status: 'OCCUPIED' },
    { roomNumber: '203', floorId: floor2.id, roomTypeId: vipFamily.id, status: 'AVAILABLE' },
    { roomNumber: '301', floorId: floor3.id, roomTypeId: deluxeDouble.id, status: 'CLEANING' },
    { roomNumber: '302', floorId: floor3.id, roomTypeId: vipFamily.id, status: 'MAINTENANCE' },
  ];

  for (const r of roomsData) {
    await prisma.room.upsert({
      where: { roomNumber: r.roomNumber },
      update: { status: r.status },
      create: r,
    });
  }

  // 6. Services
  const servicesData = [
    { name: 'Nước suối Aquafina 500ml', category: 'MINIBAR', price: 15000, unit: 'chai' },
    { name: 'Bia Heineken lon', category: 'MINIBAR', price: 30000, unit: 'lon' },
    { name: 'Mì ly Handy Hảo Hảo', category: 'FOOD', price: 20000, unit: 'hộp' },
    { name: 'Giặt ủi quần áo bộ', category: 'LAUNDRY', price: 50000, unit: 'bộ' },
    { name: 'Thuê xe máy Honda Vision', category: 'TRANSPORT', price: 120000, unit: 'ngày' },
  ];

  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }

  console.log('✅ Khởi tạo dữ liệu mẫu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
