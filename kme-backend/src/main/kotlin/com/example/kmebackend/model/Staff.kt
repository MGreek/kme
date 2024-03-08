package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class StaffId(
    @Embedded
    val staffSystemId: StaffSystemId,
    @Column(name = "staves_order")
    val stavesOrder: Long,
)

@Entity
data class Staff(
    @EmbeddedId
    val staffId: StaffId,
    @MapsId("staffSystemId") @ManyToOne
    val staffSystem: StaffSystem,
    @OneToMany(mappedBy = "staff")
    @OrderColumn(name = "measures_order")
    val measures: List<Measure> = emptyList(),
    val metadata: String? = null,
)
