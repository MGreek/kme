package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class GroupingId(
    @Embedded
    val voiceId: VoiceId,
    @Column(name = "groupings_order")
    val groupingsOrder: Long,
)

@Entity
data class Grouping(
    @EmbeddedId
    val groupingId: GroupingId,
    @MapsId("voiceId") @ManyToOne
    val voice: Voice,
    @OneToMany(mappedBy = "grouping")
    @OrderColumn(name = "grouping_entries_order")
    val groupingEntries: List<GroupingEntry> = emptyList(),
    val metadata: String? = null,
)
