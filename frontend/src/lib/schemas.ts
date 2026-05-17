import { z } from 'zod';

// ==================== Auth Schemas ====================

export const SignUpSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/[A-Z]/, 'Password must contain an uppercase letter')
		.regex(/[0-9]/, 'Password must contain a number'),
	username: z.string().min(2, 'Username must be at least 2 characters').max(50),
});

export const LoginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
});

export const ResetPasswordSchema = z.object({
	email: z.string().email('Invalid email address'),
});

export const UpdatePasswordSchema = z.object({
	token: z.string().min(1, 'Reset token is required'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/[A-Z]/, 'Password must contain an uppercase letter')
		.regex(/[0-9]/, 'Password must contain a number'),
});

// ==================== User Schemas ====================

export const UserSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	username: z.string(),
	emailVerified: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	settings: z.record(z.string(), z.unknown()).optional(),
});

export type User = z.infer<typeof UserSchema>;

// ==================== Scrapboard Schemas ====================

export const ScrapboardVisibility = z.enum(['private', 'shared']);

export const CreateScrapboardSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255),
	description: z.string().max(1000).optional().default(''),
});

export const UpdateScrapboardSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255).optional(),
	description: z.string().max(1000).optional(),
	visibility: ScrapboardVisibility.optional(),
});

export const ScrapboardSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	description: z.string(),
	ownerUserId: z.string().uuid(),
	visibility: ScrapboardVisibility,
	shareToken: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deletedAt: z.coerce.date().nullable(),
});

export type Scrapboard = z.infer<typeof ScrapboardSchema>;

// ==================== Note Schemas ====================

export const NoteType = z.enum(['typed', 'handwritten']);
export const BackgroundTheme = z.enum([
	'yellow_sticky',
	'pink_sticky',
	'kraft_paper',
	'postcard',
	'blue_sticky',
	'scrap',
]);

export type BackgroundThemeValue = z.infer<typeof BackgroundTheme>;

export const CreateNoteSchema = z.object({
	scrapboardId: z.string().uuid(),
	type: NoteType,
	content: z.string().max(5000).optional(),
	imageUrl: z.string().url().optional(),
	positionX: z.number().default(0),
	positionY: z.number().default(0),
	width: z.number().default(200),
	height: z.number().default(150),
	backgroundTheme: BackgroundTheme.default('yellow_sticky'),
});

export const UpdateNoteSchema = z.object({
	content: z.string().max(5000).optional(),
	positionX: z.number().optional(),
	positionY: z.number().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	backgroundTheme: BackgroundTheme.optional(),
	zOrder: z.number().optional(),
});

export const NoteSchema = z.object({
	id: z.string().uuid(),
	scrapboardId: z.string().uuid(),
	type: NoteType,
	content: z.string().nullable(),
	imageUrl: z.string().nullable(),
	positionX: z.number(),
	positionY: z.number(),
	width: z.number(),
	height: z.number(),
	backgroundTheme: BackgroundTheme,
	zOrder: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deletedAt: z.coerce.date().nullable(),
});

export type Note = z.infer<typeof NoteSchema>;

// ==================== Image Schemas ====================

export const CreateImageSchema = z.object({
	scrapboardId: z.string().uuid(),
	file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
		message: 'File size must be less than 5MB',
	}),
	positionX: z.number().default(0),
	positionY: z.number().default(0),
	width: z.number().default(300),
	height: z.number().default(300),
});

export const UpdateImageSchema = z.object({
	positionX: z.number().optional(),
	positionY: z.number().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	rotationDegrees: z.number().default(0).optional(),
});

export const ImageSchema = z.object({
	id: z.string().uuid(),
	scrapboardId: z.string().uuid(),
	fileUrl: z.string().url(),
	mimeType: z.string(),
	storagePath: z.string(),
	positionX: z.number(),
	positionY: z.number(),
	width: z.number(),
	height: z.number(),
	rotationDegrees: z.number(),
	zOrder: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deletedAt: z.coerce.date().nullable(),
});

export type Image = z.infer<typeof ImageSchema>;

// ==================== Line Schemas ====================

export const LineStyle = z.enum(['solid', 'dashed']);

export const CreateLineSchema = z.object({
	scrapboardId: z.string().uuid(),
	fromElementId: z.string().uuid(),
	fromElementType: z.enum(['note', 'image']),
	toElementId: z.string().uuid(),
	toElementType: z.enum(['note', 'image']),
	style: LineStyle.default('solid'),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
		.default('#000000'),
});

export const UpdateLineSchema = z.object({
	style: LineStyle.optional(),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
		.optional(),
});

export const LineSchema = z.object({
	id: z.string().uuid(),
	scrapboardId: z.string().uuid(),
	fromElementId: z.string().uuid(),
	fromElementType: z.enum(['note', 'image']),
	toElementId: z.string().uuid(),
	toElementType: z.enum(['note', 'image']),
	style: LineStyle,
	color: z.string(),
	zOrder: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deletedAt: z.coerce.date().nullable(),
});

export type Line = z.infer<typeof LineSchema>;

// ==================== SharedAccess Schemas ====================

export const CreateSharedAccessSchema = z.object({
	scrapboardId: z.string().uuid(),
	expiresAt: z.coerce.date().optional(),
});

export const SharedAccessSchema = z.object({
	id: z.string().uuid(),
	scrapboardId: z.string().uuid(),
	shareToken: z.string(),
	expiresAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
});

export type SharedAccess = z.infer<typeof SharedAccessSchema>;

// ==================== API Response Schemas ====================

export const ApiErrorSchema = z.object({
	error: z.string(),
	message: z.string(),
	status: z.number(),
	details: z.record(z.string(), z.unknown()).optional(),
});

export const ApiSuccessSchema = z.object({
	success: z.boolean(),
	data: z.unknown().optional(),
	message: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ApiSuccess = z.infer<typeof ApiSuccessSchema>;
