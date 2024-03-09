package com.example.kmebackend.model

import com.example.kmebackend.model.converter.UUIDConverter
import jakarta.persistence.*
import java.util.UUID

@Embeddable
data class StaffSystemId(
    @Column(name = "staff_system_id")
    @Convert(converter = UUIDConverter::class)
    val staffSystemId: UUID = UUID.randomUUID(),
)

@Entity
data class StaffSystem(
    @EmbeddedId
    val staffSystemId: StaffSystemId,
    @OneToMany(mappedBy = "staffSystem", cascade = [CascadeType.PERSIST])
    @OrderColumn(name = "staves_order")
    val staves: List<Staff> = emptyList(),
    val metadata: String? = null,
)
