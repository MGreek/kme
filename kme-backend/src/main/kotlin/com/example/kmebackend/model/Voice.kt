package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class VoiceId(
    @Embedded
    val measureId: MeasureId,
    @Column(name = "voices_order")
    val voicesOrder: Int,
)

@Entity
data class Voice(
    @EmbeddedId
    val voiceId: VoiceId? = null,
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumns(
        // all columns from MeasureId
        JoinColumn(
            name = "staff_system_id",
            referencedColumnName = "staff_system_id",
            insertable = false,
            updatable = false,
        ),
        JoinColumn(
            name = "staves_order",
            referencedColumnName = "staves_order",
            insertable = false,
            updatable = false,
        ),
        JoinColumn(
            name = "measures_order",
            referencedColumnName = "measures_order",
            insertable = false,
            updatable = false,
        ),
    )
    val measure: Measure? = null,
    val metadata: String? = null,
)