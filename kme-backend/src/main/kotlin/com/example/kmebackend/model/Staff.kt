package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class StaffId(
    @Embedded
    val staffSystemId: StaffSystemId,
    @Column(name = "staves_order")
    val stavesOrder: Int,
)

@Entity
data class Staff(
    @EmbeddedId
    val staffId: StaffId? = null,
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "staff_system_id",
        referencedColumnName = "staff_system_id",
        insertable = false,
        updatable = false,
    )
    val staffSystem: StaffSystem? = null,
    @Lob
    val metadataJson: String = "",
)