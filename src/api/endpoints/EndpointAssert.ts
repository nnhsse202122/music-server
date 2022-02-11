import { Request, Response } from "express";
import APIRoute from "../../mvc/api/APIRoute";
import APIFailResponse from "../responses/APIFailResponse";

export const assertContentIsJSON = (route: APIRoute<any, any>, req: Request): APIFailResponse | null => {
    let contentType = req.headers["content-type"];
    if (contentType !== "application/json") {
        return route.fail("api.body.content_type", {
            "content-type": contentType ?? "<unspecified>"
        });
    }

    return null;
} 

export const assertJSONBodyIsntNull = (route: APIRoute<any, any>, req: Request): APIFailResponse | null => {
    let body = req.body;
    if (body == null) {
        return route.fail("api.body.null", {});
    }
    return null;
}

export const assertJSONBodyFieldIsDefined = (route: APIRoute<any, any>, req: Request, fieldPath: string): APIFailResponse | null => {
    let obj = req.body;
    let parts = fieldPath.split("/").filter((part) => part.length > 0);

    for (let index = 0; index < parts.length; index++) {
        let part = parts[index];

        let newObj = obj[part];
        if (newObj === undefined) {
            return route.fail("api.body.field.required", {
                "field_name": part,
                "path": "/" + parts.slice(0, index).join("/"),
            });
        }

        obj = newObj;
    }

    return null;
}

export const assertJSONBodyFieldIsString = (route: APIRoute<any, any>, req: Request, fieldPath: string, nullable: boolean = false): APIFailResponse | null => {
    let obj = req.body;
    let parts = fieldPath.split("/").filter((part) => part.length > 0);

    for (let index = 0; index < parts.length; index++) {
        let part = parts[index];

        let newObj = obj[part];
        if (newObj === undefined) {
            return route.fail("api.body.field.required", {
                "field_name": part,
                "path": "/" + parts.slice(0, index).join("/")
            });
        }

        obj = newObj;
    }

    let valid_types = "string";
    if (nullable) valid_types += ",null";

    let fieldName = parts[parts.length - 1];
    let path = "/" + parts.slice(0, parts.length - 1).join("/");

    if (!nullable && obj == null) {
        return route.fail("api.body.field.null", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "boolean") {
        return route.fail("api.body.field.boolean", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "bigint") {
        return route.fail("api.body.field.number", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (Array.isArray(obj)) {
        return route.fail("api.body.field.array", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "object") {
        return route.fail("api.body.field.object", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "number") {
        return route.fail("api.body.field.number", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "string") {
        return null;
    }

    return route.fail("api.body.field.invalid_type", {
        "field_name": fieldName,
        "path": path,
        "valid_types": valid_types
    });
}

export const assertJSONBodyFieldIsBoolean = (route: APIRoute<any, any>, req: Request, fieldPath: string, nullable: boolean = false): APIFailResponse | null => {
    let obj = req.body;
    let parts = fieldPath.split("/").filter((part) => part.length > 0);

    for (let index = 0; index < parts.length; index++) {
        let part = parts[index];

        let newObj = obj[part];
        if (newObj === undefined) {
            return route.fail("api.body.field.required", {
                "field_name": part,
                "path": "/" + parts.slice(0, index).join("/")
            });
        }

        obj = newObj;
    }

    let valid_types = "boolean";
    if (nullable) valid_types += ",null";

    let fieldName = parts[parts.length - 1];
    let path = "/" + parts.slice(0, parts.length - 1).join("/");

    if (!nullable && obj == null) {
        return route.fail("api.body.field.null", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "bigint") {
        return route.fail("api.body.field.number", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "string") {
        return route.fail("api.body.field.boolean", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (Array.isArray(obj)) {
        return route.fail("api.body.field.array", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "object") {
        return route.fail("api.body.field.object", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "number") {
        return route.fail("api.body.field.number", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "boolean") {
        return null;
    }

    return route.fail("api.body.field.invalid_type", {
        "field_name": fieldName,
        "path": path,
        "valid_types": valid_types
    });
}


export const assertJSONBodyFieldIsNumber = (route: APIRoute<any, any>, req: Request, fieldPath: string, nullable: boolean = false): APIFailResponse | null => {
    let obj = req.body;
    let parts = fieldPath.split("/").filter((part) => part.length > 0);

    for (let index = 0; index < parts.length; index++) {
        let part = parts[index];

        let newObj = obj[part];
        if (newObj === undefined) {
            return route.fail("api.body.field.required", {
                "field_name": part,
                "path": "/" + parts.slice(0, index).join("/")
            });
        }

        obj = newObj;
    }

    let valid_types = "number";
    if (nullable) valid_types += ",null";

    let fieldName = parts[parts.length - 1];
    let path = "/" + parts.slice(0, parts.length - 1).join("/");

    if (!nullable && obj == null) {
        return route.fail("api.body.field.null", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "string") {
        return route.fail("api.body.field.boolean", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (Array.isArray(obj)) {
        return route.fail("api.body.field.array", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "object") {
        return route.fail("api.body.field.object", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "boolean") {
        return route.fail("api.body.field.boolean", {
            "field_name": fieldName,
            "path": path,
            "valid_types": valid_types
        });
    }

    if (typeof obj === "number" || typeof obj === "bigint") {
        return null;
    }

    return route.fail("api.body.field.invalid_type", {
        "field_name": fieldName,
        "path": path,
        "valid_types": valid_types
    });
}