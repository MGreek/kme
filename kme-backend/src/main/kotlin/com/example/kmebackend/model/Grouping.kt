package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class GroupingId(
    @Embedded
    val voiceId: VoiceId,
    @Column(name = "groupings_order")
    val groupingsOrder: Int,
)

@Entity
data class Grouping(
    @EmbeddedId
    val groupingId: GroupingId? = null,
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumns(
        // all columns from VoiceId
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
        JoinColumn(
            name = "voices_order",
            referencedColumnName = "voices_order",
            insertable = false,
            updatable = false,
        ),
    )
    val voice: Voice? = null,
    val metadata: String? = null,
)
