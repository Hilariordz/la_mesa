import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const { email, password, fullName } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: 'Email y contraseña requeridos' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Compatibilidad con triggers que esperan `name` o `full_name`.
    const normalizedName = String(fullName || '').trim();

    // Crear usuario sin iniciar sesión automáticamente
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: normalizedName,
        name: normalizedName,
      },
      email_confirm: true, // no requiere confirmación de email para poder loguear de inmediato
    });

    if (error) {
      console.error('[register] Supabase error:', JSON.stringify(error));
      const message =
        error.message === 'Database error creating new user'
          ? 'Error de base de datos al crear usuario. Revisa en Supabase si tienes un trigger en auth.users que inserta en profiles con campos obligatorios.'
          : error.message;

      return NextResponse.json(
        { ok: false, message, code: error.status },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { ok: false, message: 'Error al crear cuenta' },
        { status: 400 }
      );
    }

    // No se crea ninguna sesión — el usuario debe hacer login manualmente
    return NextResponse.json({
      ok: true,
      message: 'Cuenta creada exitosamente.',
    });
  } catch (error) {
    console.error('[register] Unexpected error:', error);
    return NextResponse.json(
      { ok: false, message: 'Error interno al registrar usuario' },
      { status: 500 }
    );
  }
}
