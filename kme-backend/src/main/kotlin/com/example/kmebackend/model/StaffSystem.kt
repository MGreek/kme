package com.example.kmebackend.model

import jakarta.persistence.*
import java.util.UUID

enum class ConnectorType {
    None,
    Brace,
    Bracket,
}

@Embeddable
data class StaffSystemMetadata(
    @Enumerated(EnumType.STRING)
    val connectorType: ConnectorType = ConnectorType.Brace,
)

@Embeddable
data class StaffSystemId(
    @Column(name = "staff_system_id")
    val staffSystemId: String = UUID.randomUUID().toString(),
)

@Entity
data class StaffSystem(
    @EmbeddedId
    val staffSystemId: StaffSystemId? = null,
    @Embedded
    val metadata: StaffSystemMetadata = StaffSystemMetadata(),
)