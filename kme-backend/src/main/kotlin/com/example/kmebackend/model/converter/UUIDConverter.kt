package com.example.kmebackend.model.converter

import jakarta.persistence.AttributeConverter
import java.util.UUID

class UUIDConverter : AttributeConverter<UUID, String> {
    override fun convertToDatabaseColumn(attribute: UUID?): String {
        return attribute?.toString() ?: throw UnsupportedOperationException()
    }

    override fun convertToEntityAttribute(dbData: String?): UUID {
        return if (dbData != null) UUID.fromString(dbData) else throw UnsupportedOperationException()
    }
}
