export class HttpPresenters {
  static ok(data: any) {
    return {
      status: 200,
      data,
    };
  }

  static created(data: any) {
    return {
      status: 201,
      data,
    };
  }

  static noContent() {
    return {
      status: 204,
    };
  }

  static badRequest(message: string) {
    return { status: 400, error: message };
  }

  static unauthorized(message: string) {
    return { status: 401, error: message };
  }

  static forbidden(message: string) {
    return { status: 403, error: message };
  }

  static internalServerError() {
    return { status: 500, error: "Internal server error" };
  }

  static notFound(message: string) {
    return { status: 404, error: message };
  }
}
